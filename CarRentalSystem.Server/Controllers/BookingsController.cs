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
    /// <remarks>
    /// Supports both **authenticated** and **guest** bookings.
    ///
    /// - **Authenticated users** — the booking is automatically linked to the signed-in user's account.
    ///   Guest fields are ignored.
    /// - **Guest users** — `GuestName` and `GuestEmail` are **required**. `GuestPhone` is optional.
    ///
    /// The system validates that the vehicle exists, is available (status = Active),
    /// and has no overlapping bookings for the requested date range. A unique confirmation
    /// code (format `CRS-XXXXXX`) is generated for every booking.
    ///
    /// The response includes a `CheckoutUrl` field which will contain a Stripe Checkout
    /// redirect URL once payment integration is active (currently `null`).
    /// </remarks>
    /// <param name="dto">The booking details including vehicle ID, dates, and optional guest info.</param>
    /// <response code="201">Booking created successfully. Returns confirmation details.</response>
    /// <response code="400">
    /// Validation failed. Common reasons:
    /// - Guest booking without GuestName or GuestEmail.
    /// - Vehicle does not exist or is not available.
    /// - EndDate is before StartDate.
    /// - Dates overlap with an existing booking.
    /// </response>
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
    /// <remarks>
    /// This is the primary lookup method for guest users who do not have an account.
    /// Confirmation codes follow the format `CRS-XXXXXX` and are returned when a booking is created.
    /// No authentication is required.
    /// </remarks>
    /// <param name="code">The booking confirmation code (e.g. `CRS-A1B2C3`).</param>
    /// <response code="200">The booking was found.</response>
    /// <response code="404">No booking exists with the specified confirmation code.</response>
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
    /// Get a booking by its unique ID.
    /// </summary>
    /// <remarks>
    /// Requires authentication with the **CustomerOnly** policy.
    /// Only the customer who owns the booking can access it.
    /// </remarks>
    /// <param name="id">The unique identifier of the booking.</param>
    /// <response code="200">The booking was found.</response>
    /// <response code="401">The request is not authenticated.</response>
    /// <response code="403">The authenticated user does not have the required role.</response>
    /// <response code="404">No booking exists with the specified ID.</response>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType<BookingDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        return booking is null ? NotFound() : Ok(booking);
    }

    /// <summary>
    /// Get all bookings for the currently authenticated user.
    /// </summary>
    /// <remarks>
    /// Returns every booking associated with the signed-in user's account,
    /// regardless of status (Pending, Confirmed, Cancelled, Completed).
    /// Requires authentication with the **CustomerOnly** policy.
    /// </remarks>
    /// <response code="200">A list of the user's bookings (may be empty).</response>
    /// <response code="401">The request is not authenticated or the user ID claim is missing.</response>
    /// <response code="403">The authenticated user does not have the required role.</response>
    [HttpGet("my")]
    [Authorize(Policy = "CustomerOnly")]
    [ProducesResponseType<List<BookingDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    /// <remarks>
    /// Cancels the booking and marks it with a `Cancelled` status. No authentication
    /// is required — anyone with the confirmation code can cancel the booking.
    ///
    /// This operation is idempotent-safe: attempting to cancel an already-cancelled
    /// booking will return 404.
    /// </remarks>
    /// <param name="code">The booking confirmation code (e.g. `CRS-A1B2C3`).</param>
    /// <response code="204">The booking was successfully cancelled.</response>
    /// <response code="404">No active booking exists with the specified confirmation code.</response>
    [HttpDelete("{code}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelBooking(string code)
    {
        var result = await _bookingService.CancelBookingAsync(code);
        return result ? NoContent() : NotFound();
    }
[HttpGet("{id}")]
public async Task<ActionResult<BookingResponse>> GetBookingById(int id)
{
    // 1. Look in the database for the booking ID the user typed in
    // .Include(b => b.Vehicle) makes sure we also grab the car info
    var booking = await _context.Bookings
        .Include(b => b.Vehicle)
        .FirstOrDefaultAsync(b => b.Id == id);

    // 2. If we can't find it, tell the user "Not Found"
    if (booking == null)
    {
        return NotFound(new { message = $"Booking with ID {id} not found." });
    }

    // 3. If we found it, package it up nicely into our Blueprint from Step 1
    var response = new BookingResponse
    {
        BookingId = booking.Id,
        VehicleName = $"{booking.Vehicle.Make} {booking.Vehicle.Model}",
        StartDate = booking.StartDate,
        EndDate = booking.EndDate,
        TotalPrice = booking.TotalPrice,
        Status = booking.Status.ToString()
    };

    // 4. Send it back to the frontend
    return Ok(response);
}}
