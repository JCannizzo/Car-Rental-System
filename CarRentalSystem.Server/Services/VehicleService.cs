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
        if (vehicle == null) return null;
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
        };
    }

    public async Task<PaginatedResult<VehicleDto>> GetAvailableAsync(VehicleQueryParams query)
    {
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var q = _dbContext.Vehicles
            .Where(v => v.VehicleStatus == VehicleStatus.Active);

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
            var start = query.StartDate.Value.ToDateTime(TimeOnly.MinValue);
            var end = query.EndDate.Value.ToDateTime(TimeOnly.MinValue);
            
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

        var items = await q
            .OrderBy(v => v.PricePerDay)
            .ThenBy(v => v.Id)
            .Take(pageSize + 1)
            .Select(v => new VehicleDto
            {
                Id = v.Id,
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                Category = v.Category.ToString(),
                Transmission = v.Transmission,
                FuelType = v.FuelType,
                Seats = v.Seats,
                Doors = v.Doors,
                PricePerDay = v.PricePerDay,
                Mileage = v.Mileage,
                Features = v.Features,
                ImageUrl = v.ImageUrl,
                ImageUrlFront = v.ImageUrlFront,
            })
            .ToListAsync();

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

    public Task<List<VehicleDto>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public Task<VehicleDto> CreateAsync()
    {
        throw new NotImplementedException();
    }

    public Task<VehicleDto> UpdateAsync(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateStatusAsync(Guid id, VehicleStatus status)
    {
        throw new NotImplementedException();
    }
}