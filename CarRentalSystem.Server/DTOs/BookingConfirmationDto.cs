namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Returned after a booking is successfully created. Contains the confirmation
/// code and summary details needed for the customer to track their reservation.
/// </summary>
public class BookingConfirmationDto
{
    /// <summary>Unique identifier of the newly created booking.</summary>
    public Guid BookingId { get; set; }

    /// <summary>Human-readable confirmation code (format: CRS-XXXXXX). Use this to look up or cancel the booking.</summary>
    public string ConfirmationCode { get; set; } = string.Empty;

    /// <summary>The unique identifier of the booked vehicle.</summary>
    public Guid VehicleId { get; set; }

    /// <summary>Short description of the vehicle (e.g. "2024 Toyota Camry").</summary>
    public string VehicleSummary { get; set; } = string.Empty;

    /// <summary>Rental start date and time (UTC).</summary>
    public DateTime StartDate { get; set; }

    /// <summary>Rental end date and time (UTC).</summary>
    public DateTime EndDate { get; set; }

    /// <summary>Total rental cost in USD, calculated as days multiplied by the vehicle's daily rate.</summary>
    public decimal TotalPrice { get; set; }

    /// <summary>Current booking status (Pending, Confirmed, Cancelled, or Completed).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Current payment status (Unpaid, Paid, or Refunded).</summary>
    public string PaymentStatus { get; set; } = string.Empty;

    /// <summary>
    /// Stripe Checkout redirect URL for completing payment.
    /// Currently null — will be populated once Stripe integration is active.
    /// </summary>
    public string? CheckoutUrl { get; set; }
}
