using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

public class CreateRatingDto
{
    [Required]
    public Guid BookingId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Score { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}

public class RatingDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VehicleRatingSummaryDto
{
    public Guid VehicleId { get; set; }
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public List<RatingDto> Ratings { get; set; } = new();
}