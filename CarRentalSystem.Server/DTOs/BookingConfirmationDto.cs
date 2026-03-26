namespace CarRentalSystem.Server.DTOs;

public class BookingConfirmationDto
{
    public Guid BookingId { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string VehicleSummary { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;

    /// <summary>
    /// Stripe Checkout redirect URL. Null until Stripe integration is active.
    /// </summary>
    public string? CheckoutUrl { get; set; }
}
