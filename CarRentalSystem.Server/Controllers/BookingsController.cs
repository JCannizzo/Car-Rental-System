using System.Security.Claims;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        Guid? userId = null;
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        if (!userId.HasValue)
        {
            if (string.IsNullOrWhiteSpace(dto.GuestName) || string.IsNullOrWhiteSpace(dto.GuestEmail))
            {
                return BadRequest(new { error = "Guest bookings require GuestName and GuestEmail." });
            }
        }

        try
        {
            var confirmation = await _bookingService.CreateBookingAsync(dto, userId);
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

    [HttpGet("confirmation/{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByConfirmationCode(string code)
    {
        var booking = await _bookingService.GetBookingByConfirmationCodeAsync(code);
        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CustomerOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpGet("my")]
    [Authorize(Policy = "CustomerOnly")]
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

    [HttpDelete("{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> CancelBooking(string code)
    {
        var result = await _bookingService.CancelBookingAsync(code);
        return result ? NoContent() : NotFound();
    }
}
