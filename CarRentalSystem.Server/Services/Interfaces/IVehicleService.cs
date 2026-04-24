using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IVehicleService
{
    Task<VehicleDto?> GetVehicleAsync(Guid id);
    Task<PaginatedResult<VehicleDto>> GetAvailableAsync(VehicleQueryParams query);

    Task<List<VehicleDto>> GetAllAsync();
    Task<VehicleDto> CreateAsync(VehicleUpsertDto dto);
    Task<VehicleDto?> UpdateAsync(Guid id, VehicleUpsertDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<VehicleDto?> UpdateStatusAsync(Guid id, string status);
}
