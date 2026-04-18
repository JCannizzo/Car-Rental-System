namespace CarRentalSystem.Server.Models;

public class BookingResponse
{
    public int BookingId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
}