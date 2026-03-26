namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Full booking details returned when looking up an existing reservation.
/// </summary>
public class BookingDto
{
    /// <summary>Unique identifier of the booking.</summary>
    public Guid Id { get; set; }

    /// <summary>Human-readable confirmation code (format: CRS-XXXXXX).</summary>
    public string ConfirmationCode { get; set; } = string.Empty;

    /// <summary>The unique identifier of the booked vehicle.</summary>
    public Guid VehicleId { get; set; }

    /// <summary>Short description of the vehicle (e.g. "2024 Toyota Camry").</summary>
    public string VehicleSummary { get; set; } = string.Empty;

    /// <summary>ID of the authenticated user who made the booking. Null for guest bookings.</summary>
    public Guid? UserId { get; set; }

    /// <summary>Full name provided by a guest customer. Null for authenticated bookings.</summary>
    public string? GuestName { get; set; }

    /// <summary>Email address provided by a guest customer. Null for authenticated bookings.</summary>
    public string? GuestEmail { get; set; }

    /// <summary>Rental start date and time (UTC).</summary>
    public DateTime StartDate { get; set; }

    /// <summary>Rental end date and time (UTC).</summary>
    public DateTime EndDate { get; set; }

    /// <summary>Total rental cost in USD.</summary>
    public decimal TotalPrice { get; set; }

    /// <summary>Current booking status (Pending, Confirmed, Cancelled, or Completed).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Current payment status (Unpaid, Paid, or Refunded).</summary>
    public string PaymentStatus { get; set; } = string.Empty;

    /// <summary>Timestamp when the booking was created (UTC).</summary>
    public DateTime CreatedAt { get; set; }
}
