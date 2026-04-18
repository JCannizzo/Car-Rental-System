using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly CarRentalSystemDbContext _context;

    public RatingsController(CarRentalSystemDbContext context)
    {
        _context = context;
    }

    // SCRUM-50: POST /api/ratings
    [HttpPost]
    public async Task<ActionResult<RatingDto>> CreateRating([FromBody] CreateRatingDto dto)
    {
        // SCRUM-54: Check that the booking exists and is completed
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

        if (booking == null)
            return NotFound("Booking not found.");

        if (booking.Status != BookingStatus.Completed)
            return BadRequest("You can only rate a vehicle after the rental is completed.");

        // Check if a rating already exists for this booking
        var existingRating = await _context.Ratings
            .FirstOrDefaultAsync(r => r.BookingId == dto.BookingId);

        if (existingRating != null)
            return BadRequest("You have already submitted a rating for this booking.");

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            VehicleId = booking.VehicleId,
            BookingId = dto.BookingId,
            UserId = booking.UserId ?? Guid.Empty,
            Score = dto.Score,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicleRatings), new { vehicleId = rating.VehicleId }, new RatingDto
        {
            Id = rating.Id,
            VehicleId = rating.VehicleId,
            BookingId = rating.BookingId,
            UserId = rating.UserId,
            Score = rating.Score,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        });
    }

    // SCRUM-51: GET /api/ratings/vehicle/{vehicleId}/average
    [HttpGet("vehicle/{vehicleId}/average")]
    public async Task<ActionResult<double>> GetAverageRating(Guid vehicleId)
    {
        var ratings = await _context.Ratings
            .Where(r => r.VehicleId == vehicleId)
            .ToListAsync();

        if (!ratings.Any())
            return Ok(0);

        var average = ratings.Average(r => r.Score);
        return Ok(Math.Round(average, 2));
    }

    // SCRUM-53: GET /api/ratings/vehicle/{vehicleId}
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<VehicleRatingSummaryDto>> GetVehicleRatings(Guid vehicleId)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId);

        if (vehicle == null)
            return NotFound("Vehicle not found.");

        var ratings = await _context.Ratings
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(new VehicleRatingSummaryDto
        {
            VehicleId = vehicleId,
            AverageRating = ratings.Any() ? Math.Round(ratings.Average(r => r.Score), 2) : 0,
            TotalRatings = ratings.Count,
            Ratings = ratings.Select(r => new RatingDto
            {
                Id = r.Id,
                VehicleId = r.VehicleId,
                BookingId = r.BookingId,
                UserId = r.UserId,
                Score = r.Score,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList()
        });
    }
}