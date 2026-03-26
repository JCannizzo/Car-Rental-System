namespace CarRentalSystem.Data.Models;

public class Booking
{
    public Guid Id { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
    public Guid? UserId { get; set; }
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? StripeSessionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public enum PaymentStatus
{
    Unpaid,
    Paid,
    Refunded
}
