namespace CarRentalSystem.Server.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string VehicleSummary { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
