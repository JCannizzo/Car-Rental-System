using System.Text;
using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Server.Services;

public class VehicleService : IVehicleService
{
    private const int MaxPageSize = 50;

    private readonly ILogger<VehicleService> _logger;
    private readonly CarRentalSystemDbContext _dbContext;
    
    public VehicleService(CarRentalSystemDbContext dbContext, ILogger<VehicleService> logger)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    public async Task<VehicleDto?> GetVehicleAsync(Guid id)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(id);
        return vehicle == null ? null : MapToDto(vehicle);
    }

    public async Task<PaginatedResult<VehicleDto>> GetAvailableAsync(VehicleQueryParams query)
    {
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var q = _dbContext.Vehicles
            .Where(v => v.VehicleStatus == VehicleStatus.Available);

        // Filters
        if (query.Category.HasValue)
            q = q.Where(v => v.Category == query.Category);
        if (query.MinSeats.HasValue)
            q = q.Where(v => v.Seats >= query.MinSeats);
        if (query.MaxPricePerDay.HasValue)
            q = q.Where(v => v.PricePerDay <= query.MaxPricePerDay);
        if (query.TransmissionType != null)
            q = q.Where(v => v.Transmission == query.TransmissionType);
        if (query.FuelType != null)
            q = q.Where(v => v.FuelType == query.FuelType);

        if (query is { StartDate: not null, EndDate: not null })
        {
            var start = query.StartDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = query.EndDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            
            var bookedIds = _dbContext.Bookings
                .Where(b =>
                    b.Status != BookingStatus.Cancelled &&
                    b.StartDate.Date < end &&
                    b.EndDate.Date > start)
                .Select(b => b.VehicleId);
            
            q = q.Where(v => !bookedIds.Contains(v.Id));
        }

        var totalCount = await q.CountAsync();

        // Cursor-based pagination
        if (query.Cursor != null)
        {
            var (cursorPrice, cursorId) = DecodeCursor(query.Cursor);
            q = q.Where(v =>
                v.PricePerDay > cursorPrice ||
                (v.PricePerDay == cursorPrice && v.Id.CompareTo(cursorId) > 0));
        }

        var vehicles = await q
            .OrderBy(v => v.PricePerDay)
            .ThenBy(v => v.Id)
            .Take(pageSize + 1)
            .ToListAsync();

        var items = vehicles
            .Select(MapToDto)
            .ToList();

        var hasMore = items.Count > pageSize;
        if (hasMore)
            items.RemoveAt(items.Count - 1);

        string? nextCursor = null;
        if (hasMore && items.Count > 0)
        {
            var last = items[^1];
            nextCursor = EncodeCursor(last.PricePerDay, last.Id);
        }

        return new PaginatedResult<VehicleDto>
        {
            Items = items,
            NextCursor = nextCursor,
            HasMore = hasMore,
            TotalCount = totalCount,
        };
    }

    // Cursor format: Base64("{pricePerDay}|{id}")
    private static string EncodeCursor(decimal price, Guid id)
    {
        var raw = $"{price}|{id}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
    }

    private static (decimal Price, Guid Id) DecodeCursor(string cursor)
    {
        try
        {
            var raw = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var parts = raw.Split('|', 2);
            return (decimal.Parse(parts[0]), Guid.Parse(parts[1]));
        }
        catch
        {
            throw new ArgumentException("Invalid pagination cursor.");
        }
    }

    public async Task<List<VehicleDto>> GetAllAsync()
    {
        var vehicles = await _dbContext.Vehicles
            .OrderBy(v => v.Make)
            .ThenBy(v => v.Model)
            .ThenBy(v => v.Year)
            .ToListAsync();

        return vehicles
            .Select(MapToDto)
            .ToList();
    }

    public async Task<VehicleDto> CreateAsync(VehicleUpsertDto dto)
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid()
        };
        ApplyVehicleChanges(vehicle, dto);

        _dbContext.Vehicles.Add(vehicle);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created vehicle {VehicleId} with status {Status}", vehicle.Id, vehicle.VehicleStatus);
        return MapToDto(vehicle);
    }

    public async Task<VehicleDto?> UpdateAsync(Guid id, VehicleUpsertDto dto)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return null;
        }

        ApplyVehicleChanges(vehicle, dto);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Updated vehicle {VehicleId}", vehicle.Id);
        return MapToDto(vehicle);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return false;
        }

        _dbContext.Vehicles.Remove(vehicle);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deleted vehicle {VehicleId}", id);
        return true;
    }

    public async Task<VehicleDto?> UpdateStatusAsync(Guid id, string status)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return null;
        }

        vehicle.VehicleStatus = ParseStatus(status);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Updated vehicle {VehicleId} status to {Status}", id, vehicle.VehicleStatus);
        return MapToDto(vehicle);
    }

    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            Category = vehicle.Category.ToString(),
            Transmission = vehicle.Transmission,
            FuelType = vehicle.FuelType,
            Seats = vehicle.Seats,
            Doors = vehicle.Doors,
            PricePerDay = vehicle.PricePerDay,
            Mileage = vehicle.Mileage,
            Features = vehicle.Features,
            ImageUrl = vehicle.ImageUrl,
            ImageUrlFront = vehicle.ImageUrlFront,
            LicensePlate = vehicle.LicensePlate,
            Status = ToApiStatus(vehicle.VehicleStatus),
        };
    }

    private static void ApplyVehicleChanges(Vehicle vehicle, VehicleUpsertDto dto)
    {
        vehicle.Make = dto.Make.Trim();
        vehicle.Model = dto.Model.Trim();
        vehicle.Year = dto.Year;
        vehicle.Category = ParseCategory(dto.Category);
        vehicle.Transmission = dto.Transmission.Trim();
        vehicle.FuelType = dto.FuelType.Trim();
        vehicle.Seats = dto.Seats;
        vehicle.Doors = dto.Doors;
        vehicle.PricePerDay = dto.PricePerDay;
        vehicle.Mileage = dto.Mileage;
        vehicle.Features = (dto.Features ?? [])
            .Where(feature => !string.IsNullOrWhiteSpace(feature))
            .Select(feature => feature.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        vehicle.ImageUrl = (dto.ImageUrl ?? string.Empty).Trim();
        vehicle.ImageUrlFront = (dto.ImageUrlFront ?? string.Empty).Trim();
        vehicle.LicensePlate = dto.LicensePlate.Trim();
        vehicle.VehicleStatus = ParseStatus(dto.Status);
    }

    private static VehicleCategory ParseCategory(string category)
    {
        if (Enum.TryParse<VehicleCategory>(category, true, out var parsedCategory))
        {
            return parsedCategory;
        }

        throw new ArgumentException($"Invalid vehicle category '{category}'.");
    }

    private static VehicleStatus ParseStatus(string status)
    {
        if (string.Equals(status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return VehicleStatus.Available;
        }

        if (Enum.TryParse<VehicleStatus>(status, true, out var parsedStatus))
        {
            return parsedStatus;
        }

        throw new ArgumentException($"Invalid vehicle status '{status}'.");
    }

    private static string ToApiStatus(VehicleStatus status)
    {
        return status.ToString().ToLowerInvariant();
    }
}
