using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

public class CreateBookingDto
{
    [Required]
    public Guid VehicleId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    // Guest fields — required when booking without an account
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
}
