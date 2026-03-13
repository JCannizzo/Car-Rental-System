namespace CarRentalSystem.Server.DTOs;

public class VehicleDto
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public int Seats { get; set; }
    public int Doors { get; set; }
    public decimal PricePerDay { get; set; }
    public int Mileage { get; set; }
    public List<string> Features { get; set; } = [];
    public string ImageUrl { get; set; } = string.Empty;
    public string ImageUrlFront { get; set; } = string.Empty;
}