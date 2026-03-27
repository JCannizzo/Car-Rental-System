using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

/// <summary>
/// Endpoints for browsing and searching the vehicle fleet.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Tags("Vehicles")]
public class VehicleController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    
    public VehicleController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    /// <summary>
    /// Search available vehicles for rental.
    /// </summary>
    /// <remarks>
    /// Returns a cursor-paginated list of vehicles that are currently active and not
    /// booked during the requested date range. Results are ordered by price (low to high).
    ///
    /// **Pagination:**
    /// - **PageSize** — number of results per page (default 20, max 50).
    /// - **Cursor** — opaque token from a previous response's `nextCursor` to fetch the next page.
    ///
    /// **Filtering options:**
    /// - **StartDate / EndDate** — exclude vehicles that have overlapping bookings.
    /// - **Category** — filter by vehicle category (Economy, Sedan, SUV, Truck, Luxury, Van, Electric).
    /// - **TransmissionType** — filter by transmission (e.g. "Automatic", "Manual").
    /// - **FuelType** — filter by fuel type (e.g. "Petrol", "Diesel", "Hybrid", "Electric").
    /// - **MinSeats** — only return vehicles with at least this many seats.
    /// - **MaxPricePerDay** — only return vehicles at or below this daily rate.
    /// </remarks>
    /// <param name="query">Optional filters and pagination parameters.</param>
    /// <response code="200">A paginated list of vehicles matching the search criteria.</response>
    /// <response code="400">The cursor parameter is invalid.</response>
    [HttpGet]
    [ProducesResponseType<PaginatedResult<VehicleDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAvailable([FromQuery] VehicleQueryParams query)
    {
        try
        {
            var result = await _vehicleService.GetAvailableAsync(query);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get vehicle details by ID.
    /// </summary>
    /// <remarks>
    /// Returns the full details of a single vehicle, including features, images, and pricing.
    /// </remarks>
    /// <param name="id">The unique identifier of the vehicle.</param>
    /// <response code="200">The vehicle was found and its details are returned.</response>
    /// <response code="404">No vehicle exists with the specified ID.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<VehicleDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var vehicle = await _vehicleService.GetVehicleAsync(id);
        return vehicle == null ? NotFound() : Ok(vehicle);
    }
}
