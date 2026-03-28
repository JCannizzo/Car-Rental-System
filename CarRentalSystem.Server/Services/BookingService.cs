using System.Security.Cryptography;
using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Server.Services;

public class BookingService : IBookingService
{
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
        // Validate vehicle exists and is available for rental
        var vehicle = await _dbContext.Vehicles.FindAsync(dto.VehicleId);
        if (vehicle is null)
            throw new InvalidOperationException("Vehicle not found.");

        if (vehicle.VehicleStatus != VehicleStatus.Active)
            throw new InvalidOperationException("Vehicle is not available for rental.");

        // Normalize dates to UTC
        var startDate = DateTime.SpecifyKind(dto.StartDate.Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(dto.EndDate.Date, DateTimeKind.Utc);

        // Validate dates
        if (startDate >= endDate)
            throw new InvalidOperationException("End date must be after start date.");

        if (startDate < DateTime.UtcNow.Date)
            throw new InvalidOperationException("Start date cannot be in the past.");

        // Check for overlapping bookings on this vehicle
        var hasOverlap = await _dbContext.Bookings.AnyAsync(b =>
            b.VehicleId == dto.VehicleId &&
            b.Status != BookingStatus.Cancelled &&
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
        var booking = await _dbContext.Bookings
            .Include(b => b.Vehicle)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode);

        return booking is null ? null : MapToDto(booking);
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

    public async Task<bool> CancelBookingAsync(string confirmationCode)
    {
        var booking = await _dbContext.Bookings
            .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode);

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
}
