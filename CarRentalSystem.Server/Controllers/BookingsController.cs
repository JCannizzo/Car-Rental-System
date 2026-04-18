using CarRentalSystem.Server.Models;
using System.Security.Claims;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Extensions;
using CarRentalSystem.Server.Services;
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
        var userId = User.GetUserId();

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
    /// Claim a paid guest booking and attach it to the signed-in customer account.
    /// </summary>
    /// <param name="dto">The booking confirmation code to claim.</param>
    /// <response code="200">The booking was successfully claimed or was already linked to the current account.</response>
    /// <response code="400">The booking exists but is not eligible to be claimed.</response>
    /// <response code="401">The request is not authenticated.</response>
    /// <response code="403">The signed-in account email does not match the checkout email on the booking.</response>
    /// <response code="404">No booking exists with the specified confirmation code.</response>
    /// <response code="409">The booking is already linked to another account.</response>
    [HttpPost("claim")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType<ClaimBookingResultDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ClaimBooking([FromBody] ClaimBookingDto dto)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var userEmail = User.GetUserEmail();

        try
        {
            var result = await _bookingService.ClaimGuestBookingAsync(dto.ConfirmationCode, userId.Value, userEmail ?? string.Empty);
            return Ok(result);
        }
        catch (BookingClaimException ex)
        {
            return StatusCode(ex.StatusCode, new { error = ex.Message });
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
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var bookings = await _bookingService.GetBookingsByUserAsync(userId.Value);
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