namespace CarRentalSystem.Server.DTOs;

public class ReturnBookingDto
{
    public string VehicleStatus { get; set; } = "Available";
    public int? Mileage { get; set; }
    public string? Notes { get; set; }
}
