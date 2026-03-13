using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Server.Services;

public class VehicleService : IVehicleService
{
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

    public async Task<List<VehicleDto>> GetAvailableAsync(VehicleQueryParams query)
    {
        var q = _dbContext.Vehicles
            .Where(v => v.VehicleStatus == VehicleStatus.Active);

        if (query.Category.HasValue)
            q = q.Where(v => v.Category == query.Category);
        if (query.MinSeats.HasValue)
            q = q.Where(v => v.Seats >= query.MinSeats);
        if (query.MaxPricePerDay.HasValue)
            q = q.Where(v => v.PricePerDay <= query.MaxPricePerDay);
        if (query.TransmissionType != null)
            q = q.Where(v => v.Transmission == query.TransmissionType);

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

        return await q
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
                Mileage =  v.Mileage,
                Features = v.Features,
                ImageUrl = v.ImageUrl,
                ImageUrlFront = v.ImageUrlFront,
            })
            .ToListAsync();
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