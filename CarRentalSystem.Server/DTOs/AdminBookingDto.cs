namespace CarRentalSystem.Server.DTOs;

public class AdminBookingDto : BookingDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? GuestPhone { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string VehicleStatus { get; set; } = string.Empty;
    public int VehicleMileage { get; set; }
}
