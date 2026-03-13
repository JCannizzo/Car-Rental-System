using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    
    public VehicleController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAvailable([FromQuery] VehicleQueryParams query)
    {
        var vehicles = await _vehicleService.GetAvailableAsync(query);
        return Ok(vehicles);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var vehicle = await _vehicleService.GetVehicleAsync(id);
        return vehicle == null ? NotFound() : Ok(vehicle);
    }
}