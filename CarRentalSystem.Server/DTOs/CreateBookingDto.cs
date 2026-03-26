using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Request body for creating a new vehicle booking.
/// </summary>
public class CreateBookingDto
{
    /// <summary>The unique identifier of the vehicle to book.</summary>
    [Required]
    public Guid VehicleId { get; set; }

    /// <summary>Rental start date and time (UTC).</summary>
    [Required]
    public DateTime StartDate { get; set; }

    /// <summary>Rental end date and time (UTC). Must be after StartDate.</summary>
    [Required]
    public DateTime EndDate { get; set; }

    /// <summary>Full name of the guest. Required for unauthenticated bookings.</summary>
    public string? GuestName { get; set; }

    /// <summary>Email address of the guest. Required for unauthenticated bookings.</summary>
    public string? GuestEmail { get; set; }

    /// <summary>Phone number of the guest. Optional.</summary>
    public string? GuestPhone { get; set; }
}
