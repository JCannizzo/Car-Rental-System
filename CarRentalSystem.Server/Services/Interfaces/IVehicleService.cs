using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IVehicleService
{
    // Public
    Task<VehicleDto?> GetVehicleAsync(Guid id);
    Task<PaginatedResult<VehicleDto>> GetAvailableAsync(VehicleQueryParams query);
    
    // Admin Dashboard
    // Methods below is implemented yet. Implement it when creating admin dashboard.
    Task<List<VehicleDto>> GetAllAsync(); // TODO: Add pagination
    Task<VehicleDto> CreateAsync(); // TODO: Create CreateVehicleDto
    Task<VehicleDto> UpdateAsync(Guid id); // TODO: Create UpdateVehicleDto
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, VehicleStatus status);
}