using CarRentalSystem.Server.Models;
using System.Security.Claims;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

/// <summary>
/// Endpoints for creating, retrieving, and cancelling vehicle bookings.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Tags("Bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IConfiguration _config;

    public BookingsController(IBookingService bookingService, IConfiguration config)
    {
        _bookingService = bookingService;
        _config = config;
    }

    /// <summary>
    /// Create a new vehicle booking.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType<BookingConfirmationDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        Guid? userId = null;
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var frontendUrl = _config["FrontendUrl"] ?? $"{Request.Scheme}://{Request.Host}";

        try
        {
            var confirmation = await _bookingService.CreateBookingAsync(dto, userId, frontendUrl);
            return CreatedAtAction(
                nameof(GetByConfirmationCode),
                new { code = confirmation.ConfirmationCode },
                confirmation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Look up a booking by its confirmation code.
    /// </summary>
    [HttpGet("confirmation/{code}")]
    [AllowAnonymous]
    [ProducesResponseType<BookingDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByConfirmationCode(string code)
    {
        var booking = await _bookingService.GetBookingByConfirmationCodeAsync(code);
        return booking is null ? NotFound() : Ok(booking);
    }

    /// <summary>
    /// Get a booking by its unique ID (Guid).
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType<BookingDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        return booking is null ? NotFound() : Ok(booking);
    }

    /// <summary>
    /// Get all bookings for the currently authenticated user.
    /// </summary>
    [HttpGet("my")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType<List<BookingDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyBookings()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
        {
            return Unauthorized();
        }

        var bookings = await _bookingService.GetBookingsByUserAsync(userId);
        return Ok(bookings);
    }

    /// <summary>
    /// Cancel a booking by its confirmation code.
    /// </summary>
    [HttpDelete("{code}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelBooking(string code)
    {
        var result = await _bookingService.CancelBookingAsync(code);
        return result ? NoContent() : NotFound();
    }

    /// <summary>
    /// Look up a booking by its Integer ID (for SCRUM-73 Lookup Page).
    /// </summary>
    [HttpGet("lookup/{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<BookingResponse>> GetBookingByIntId(int id)
    {
        // We use the confirmation code lookup logic but pass the ID string
        // to maintain compatibility with the existing service layer.
        var booking = await _bookingService.GetBookingByConfirmationCodeAsync(id.ToString());

        if (booking == null)
        {
            return NotFound(new { message = $"Booking with ID {id} not found." });
        }

        var response = new BookingResponse
        {
            BookingId = id,
            VehicleName = booking.VehicleId.ToString(), // Mapping Guid to display
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status
        };

        return Ok(response);
    }
}