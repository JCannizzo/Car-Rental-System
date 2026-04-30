using System.Security.Cryptography;
using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Server.Services;

public class BookingService : IBookingService
{
    private const int MaxPageSize = 50;
    private readonly CarRentalSystemDbContext _dbContext;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<BookingService> _logger;

    private const string ConfirmationCodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid ambiguity
    private const int ConfirmationCodeLength = 6;
    private const string ConfirmationCodePrefix = "CRS";

    public BookingService(
        CarRentalSystemDbContext dbContext,
        IPaymentService paymentService,
        ILogger<BookingService> logger)
    {
        _dbContext = dbContext;
        _paymentService = paymentService;
        _logger = logger;
    }

    public async Task<BookingConfirmationDto> CreateBookingAsync(CreateBookingDto dto, Guid? userId, string frontendBaseUrl)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(dto.VehicleId);
        if (vehicle is null)
            throw new InvalidOperationException("Vehicle not found.");

        if (vehicle.VehicleStatus != VehicleStatus.Available)
            throw new InvalidOperationException("Vehicle is not available for rental.");

        var startDate = DateTime.SpecifyKind(dto.StartDate.Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(dto.EndDate.Date, DateTimeKind.Utc);

        if (startDate >= endDate)
            throw new InvalidOperationException("End date must be after start date.");

        if (startDate < DateTime.UtcNow.Date)
            throw new InvalidOperationException("Start date cannot be in the past.");

        
        var pendingExpiry = DateTime.UtcNow.AddMinutes(-10);

        // Check for overlapping bookings on this vehicle
        var hasOverlap = await _dbContext.Bookings.AnyAsync(b =>
            b.VehicleId == dto.VehicleId &&
            b.Status != BookingStatus.Cancelled &&
            !(b.Status == BookingStatus.Pending && b.CreatedAt < pendingExpiry) &&
            b.StartDate < endDate &&
            b.EndDate > startDate);

        if (hasOverlap)
            throw new InvalidOperationException("Vehicle is not available for the selected dates.");

        var rentalDays = (endDate - startDate).Days;
        var totalPrice = rentalDays * vehicle.PricePerDay;

        var confirmationCode = await GenerateUniqueConfirmationCodeAsync();

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ConfirmationCode = confirmationCode,
            VehicleId = dto.VehicleId,
            UserId = userId,
            GuestName = userId.HasValue ? null : dto.GuestName,
            GuestEmail = userId.HasValue ? null : dto.GuestEmail,
            GuestPhone = userId.HasValue ? null : dto.GuestPhone,
            StartDate = startDate,
            EndDate = endDate,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending,
            PaymentStatus = PaymentStatus.Unpaid,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Booking {ConfirmationCode} created for vehicle {VehicleId}, {StartDate} - {EndDate}, total: {TotalPrice}",
            confirmationCode, dto.VehicleId, startDate, endDate, totalPrice);

        var checkoutUrl = await _paymentService.CreateCheckoutSessionAsync(booking, frontendBaseUrl);

        return new BookingConfirmationDto
        {
            BookingId = booking.Id,
            ConfirmationCode = booking.ConfirmationCode,
            VehicleId = booking.VehicleId,
            VehicleSummary = $"{vehicle.Year} {vehicle.Make} {vehicle.Model}",
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            PaymentStatus = booking.PaymentStatus.ToString(),
            CheckoutUrl = checkoutUrl,
        };
    }

    public async Task<BookingDto?> GetBookingByConfirmationCodeAsync(string confirmationCode)
    {
        var normalizedCode = NormalizeConfirmationCode(confirmationCode);
        if (string.IsNullOrEmpty(normalizedCode))
        {
            return null;
        }

        var booking = await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == normalizedCode);

        return booking is null ? null : MapToDto(booking);
    }

    public async Task<ClaimBookingResultDto> ClaimGuestBookingAsync(string confirmationCode, Guid userId, string userEmail)
    {
        if (string.IsNullOrWhiteSpace(userEmail))
        {
            throw new BookingClaimException(StatusCodes.Status400BadRequest, "Your account email must match the email used during checkout.");
        }

        var normalizedCode = NormalizeRequiredConfirmationCode(confirmationCode);
        var normalizedEmail = NormalizeEmail(userEmail);

        _logger.LogInformation(
            "Booking claim attempted for code {ConfirmationCode} by user {UserId}.",
            normalizedCode,
            userId);

        var booking = await _dbContext.Bookings
            .FirstOrDefaultAsync(b => b.ConfirmationCode == normalizedCode);

        if (booking is null)
        {
            throw new BookingClaimException(StatusCodes.Status404NotFound, "Booking not found.");
        }

        if (booking.PaymentStatus != PaymentStatus.Paid)
        {
            throw new BookingClaimException(StatusCodes.Status400BadRequest, "Only paid bookings can be claimed.");
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            throw new BookingClaimException(StatusCodes.Status400BadRequest, "Cancelled bookings cannot be claimed.");
        }

        if (string.IsNullOrWhiteSpace(booking.GuestEmail))
        {
            throw new BookingClaimException(StatusCodes.Status400BadRequest, "This booking cannot be claimed because it has no guest email on file.");
        }

        var normalizedGuestEmail = NormalizeEmail(booking.GuestEmail);
        if (!string.Equals(normalizedGuestEmail, normalizedEmail, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(
                "Booking claim denied for code {ConfirmationCode} because account email {UserEmail} does not match checkout email.",
                normalizedCode,
                normalizedEmail);

            throw new BookingClaimException(StatusCodes.Status403Forbidden, "Your account email must match the email used during checkout.");
        }

        if (booking.UserId.HasValue)
        {
            if (booking.UserId.Value == userId)
            {
                return new ClaimBookingResultDto
                {
                    BookingId = booking.Id,
                    ConfirmationCode = booking.ConfirmationCode,
                    Claimed = true,
                    RedirectTo = "/bookings",
                };
            }

            _logger.LogWarning(
                "Booking claim denied for code {ConfirmationCode} because it is already linked to user {ExistingUserId}.",
                normalizedCode,
                booking.UserId.Value);

            throw new BookingClaimException(StatusCodes.Status409Conflict, "This booking is already linked to another account.");
        }

        booking.UserId = userId;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Booking {ConfirmationCode} successfully claimed by user {UserId}.",
            normalizedCode,
            userId);

        return new ClaimBookingResultDto
        {
            BookingId = booking.Id,
            ConfirmationCode = booking.ConfirmationCode,
            Claimed = true,
            RedirectTo = "/bookings",
        };
    }

    public async Task<BookingDto?> GetBookingByIdAsync(Guid id)
    {
        var booking = await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == id);

        return booking is null ? null : MapToDto(booking);
    }

    public async Task<List<BookingDto>> GetBookingsByUserAsync(Guid userId)
    {
        return await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<PaginatedResult<AdminBookingDto>> GetAdminBookingsAsync(AdminBookingQueryParams query)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);
        var bookingsQuery = _dbContext.Bookings
            .Include(b => b.Vehicle)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLowerInvariant();

            bookingsQuery = bookingsQuery.Where(b =>
                b.ConfirmationCode.ToLower().Contains(search) ||
                (b.GuestName != null && b.GuestName.ToLower().Contains(search)) ||
                (b.GuestEmail != null && b.GuestEmail.ToLower().Contains(search)) ||
                (b.GuestPhone != null && b.GuestPhone.ToLower().Contains(search)) ||
                b.Vehicle.Make.ToLower().Contains(search) ||
                b.Vehicle.Model.ToLower().Contains(search) ||
                b.Vehicle.LicensePlate.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) &&
            !string.Equals(query.Status, "all", StringComparison.OrdinalIgnoreCase))
        {
            bookingsQuery = bookingsQuery.Where(b => b.Status == ParseBookingStatus(query.Status));
        }

        if (!string.IsNullOrWhiteSpace(query.PaymentStatus) &&
            !string.Equals(query.PaymentStatus, "all", StringComparison.OrdinalIgnoreCase))
        {
            bookingsQuery = bookingsQuery.Where(b => b.PaymentStatus == ParsePaymentStatus(query.PaymentStatus));
        }

        if (query.StartDate.HasValue)
        {
            var start = query.StartDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            bookingsQuery = bookingsQuery.Where(b => b.StartDate >= start);
        }

        if (query.EndDate.HasValue)
        {
            var end = query.EndDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            bookingsQuery = bookingsQuery.Where(b => b.EndDate <= end);
        }

        var totalCount = await bookingsQuery.CountAsync();
        var bookings = await ApplyAdminBookingSort(bookingsQuery, query.SortBy, query.SortDirection)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<AdminBookingDto>
        {
            Items = bookings.Select(MapToAdminDto).ToList(),
            NextCursor = null,
            HasMore = page * pageSize < totalCount,
            TotalCount = totalCount,
        };
    }

    public async Task<AdminBookingDto?> UpdateBookingStatusAsync(Guid id, string status)
    {
        var booking = await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
        {
            return null;
        }

        var nextStatus = ParseBookingStatus(status);
        if (booking.Status == BookingStatus.Completed && nextStatus != BookingStatus.Completed)
        {
            throw new InvalidOperationException("Completed bookings cannot be moved back to another status.");
        }

        if (nextStatus == BookingStatus.Confirmed && booking.PaymentStatus != PaymentStatus.Paid)
        {
            throw new InvalidOperationException("Only paid bookings can be confirmed.");
        }

        booking.Status = nextStatus;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Admin updated booking {ConfirmationCode} status to {Status}.", booking.ConfirmationCode, booking.Status);
        return MapToAdminDto(booking);
    }

    public async Task<AdminBookingDto?> ReturnBookingAsync(Guid id, ReturnBookingDto dto)
    {
        var booking = await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
        {
            return null;
        }

        if (booking.Status is BookingStatus.Cancelled or BookingStatus.Completed)
        {
            throw new InvalidOperationException("Cancelled or completed bookings cannot be returned.");
        }

        var returnStatus = ParseReturnVehicleStatus(dto.VehicleStatus);
        if (dto.Mileage.HasValue)
        {
            if (dto.Mileage.Value < booking.Vehicle.Mileage)
            {
                throw new InvalidOperationException("Return mileage cannot be lower than the current vehicle mileage.");
            }

            booking.Vehicle.Mileage = dto.Mileage.Value;
        }

        booking.Status = BookingStatus.Completed;
        booking.Vehicle.VehicleStatus = returnStatus;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Admin returned booking {ConfirmationCode}. Vehicle {VehicleId} set to {Status}. Notes supplied: {HasNotes}",
            booking.ConfirmationCode,
            booking.VehicleId,
            booking.Vehicle.VehicleStatus,
            !string.IsNullOrWhiteSpace(dto.Notes));

        return MapToAdminDto(booking);
    }

    public async Task<bool> CancelBookingAsync(string confirmationCode)
    {
        var normalizedCode = NormalizeConfirmationCode(confirmationCode);
        if (string.IsNullOrEmpty(normalizedCode))
        {
            return false;
        }

        var booking = await _dbContext.Bookings
            .FirstOrDefaultAsync(b => b.ConfirmationCode == normalizedCode);

        if (booking is null)
            return false;

        if (booking.Status == BookingStatus.Cancelled)
            return false;

        booking.Status = BookingStatus.Cancelled;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Booking {ConfirmationCode} cancelled.", confirmationCode);
        return true;
    }

    private async Task<string> GenerateUniqueConfirmationCodeAsync()
    {
        const int maxAttempts = 10;

        for (var i = 0; i < maxAttempts; i++)
        {
            var code = $"{ConfirmationCodePrefix}-{GenerateRandomCode()}";

            var exists = await _dbContext.Bookings
                .AnyAsync(b => b.ConfirmationCode == code);

            if (!exists)
                return code;
        }

        throw new InvalidOperationException("Failed to generate a unique confirmation code after multiple attempts.");
    }

    private static string GenerateRandomCode()
    {
        return string.Create(ConfirmationCodeLength, 0, (span, _) =>
        {
            Span<byte> randomBytes = stackalloc byte[ConfirmationCodeLength];
            RandomNumberGenerator.Fill(randomBytes);
            for (var i = 0; i < span.Length; i++)
            {
                span[i] = ConfirmationCodeChars[randomBytes[i] % ConfirmationCodeChars.Length];
            }
        });
    }

    private static BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            ConfirmationCode = booking.ConfirmationCode,
            VehicleId = booking.VehicleId,
            VehicleSummary = booking.Vehicle is not null
                ? $"{booking.Vehicle.Year} {booking.Vehicle.Make} {booking.Vehicle.Model}"
                : string.Empty,
            UserId = booking.UserId,
            GuestName = booking.GuestName,
            GuestEmail = booking.GuestEmail,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            PaymentStatus = booking.PaymentStatus.ToString(),
            CreatedAt = booking.CreatedAt,
        };
    }

    private static AdminBookingDto MapToAdminDto(Booking booking)
    {
        var vehicleSummary = booking.Vehicle is not null
            ? $"{booking.Vehicle.Year} {booking.Vehicle.Make} {booking.Vehicle.Model}"
            : string.Empty;

        return new AdminBookingDto
        {
            Id = booking.Id,
            ConfirmationCode = booking.ConfirmationCode,
            VehicleId = booking.VehicleId,
            VehicleSummary = vehicleSummary,
            UserId = booking.UserId,
            GuestName = booking.GuestName,
            GuestEmail = booking.GuestEmail,
            GuestPhone = booking.GuestPhone,
            CustomerName = booking.GuestName ?? (booking.UserId.HasValue ? "Registered customer" : "Guest customer"),
            CustomerEmail = booking.GuestEmail ?? string.Empty,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            PaymentStatus = booking.PaymentStatus.ToString(),
            CreatedAt = booking.CreatedAt,
            LicensePlate = booking.Vehicle?.LicensePlate ?? string.Empty,
            VehicleStatus = booking.Vehicle?.VehicleStatus.ToString().ToLowerInvariant() ?? string.Empty,
            VehicleMileage = booking.Vehicle?.Mileage ?? 0,
        };
    }

    private static IOrderedQueryable<Booking> ApplyAdminBookingSort(
        IQueryable<Booking> query,
        string? sortBy,
        string? sortDirection)
    {
        var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return (sortBy ?? "createdAt").Trim().ToLowerInvariant() switch
        {
            "date" or "startdate" => descending
                ? query.OrderByDescending(b => b.StartDate).ThenByDescending(b => b.EndDate).ThenBy(b => b.Id)
                : query.OrderBy(b => b.StartDate).ThenBy(b => b.EndDate).ThenBy(b => b.Id),
            "returndate" or "enddate" => descending
                ? query.OrderByDescending(b => b.EndDate).ThenBy(b => b.Id)
                : query.OrderBy(b => b.EndDate).ThenBy(b => b.Id),
            "customer" => descending
                ? query.OrderByDescending(b => b.GuestName ?? b.GuestEmail ?? string.Empty).ThenBy(b => b.Id)
                : query.OrderBy(b => b.GuestName ?? b.GuestEmail ?? string.Empty).ThenBy(b => b.Id),
            "vehicle" => descending
                ? query.OrderByDescending(b => b.Vehicle.Make).ThenByDescending(b => b.Vehicle.Model).ThenBy(b => b.Id)
                : query.OrderBy(b => b.Vehicle.Make).ThenBy(b => b.Vehicle.Model).ThenBy(b => b.Id),
            "status" => descending
                ? query.OrderByDescending(b => b.Status).ThenByDescending(b => b.PaymentStatus).ThenBy(b => b.Id)
                : query.OrderBy(b => b.Status).ThenBy(b => b.PaymentStatus).ThenBy(b => b.Id),
            "payment" or "paymentstatus" => descending
                ? query.OrderByDescending(b => b.PaymentStatus).ThenBy(b => b.Id)
                : query.OrderBy(b => b.PaymentStatus).ThenBy(b => b.Id),
            "total" => descending
                ? query.OrderByDescending(b => b.TotalPrice).ThenBy(b => b.Id)
                : query.OrderBy(b => b.TotalPrice).ThenBy(b => b.Id),
            "createdat" => descending
                ? query.OrderByDescending(b => b.CreatedAt).ThenBy(b => b.Id)
                : query.OrderBy(b => b.CreatedAt).ThenBy(b => b.Id),
            _ => throw new ArgumentException($"Invalid booking sort field '{sortBy}'."),
        };
    }

    private static BookingStatus ParseBookingStatus(string status)
    {
        if (Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
        {
            return parsedStatus;
        }

        throw new ArgumentException($"Invalid booking status '{status}'.");
    }

    private static PaymentStatus ParsePaymentStatus(string status)
    {
        if (Enum.TryParse<PaymentStatus>(status, true, out var parsedStatus))
        {
            return parsedStatus;
        }

        throw new ArgumentException($"Invalid payment status '{status}'.");
    }

    private static VehicleStatus ParseReturnVehicleStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return VehicleStatus.Available;
        }

        if (!Enum.TryParse<VehicleStatus>(status, true, out var parsedStatus) ||
            parsedStatus is not (VehicleStatus.Available or VehicleStatus.Maintenance))
        {
            throw new ArgumentException("Returned vehicles can only be marked Available or Maintenance.");
        }

        return parsedStatus;
    }

    private static string NormalizeRequiredConfirmationCode(string confirmationCode)
    {
        var normalized = NormalizeConfirmationCode(confirmationCode);
        if (string.IsNullOrEmpty(normalized))
        {
            throw new BookingClaimException(StatusCodes.Status400BadRequest, "Confirmation code is required.");
        }

        return normalized;
    }

    private static string? NormalizeConfirmationCode(string? confirmationCode)
    {
        return string.IsNullOrWhiteSpace(confirmationCode)
            ? null
            : confirmationCode.Trim().ToUpperInvariant();
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim();
    }
}
