using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IVehicleService
{
    // Public
    Task<VehicleDto?> GetVehicleAsync(Guid id);
    Task<List<VehicleDto>> GetAvailableAsync(VehicleQueryParams query);
    
    // Admin Dashboard
    Task<List<VehicleDto>> GetAllAsync(); // TODO: Add pagination
    Task<VehicleDto> CreateAsync(); // TODO: Create CreateVehicleDto
    Task<VehicleDto> UpdateAsync(Guid id); // TODO: Create UpdateVehicleDto
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, VehicleStatus status);
}