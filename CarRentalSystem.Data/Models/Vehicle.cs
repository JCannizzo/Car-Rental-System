namespace CarRentalSystem.Data.Models;

public class Vehicle
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleCategory Category { get; set; }
    public string Transmission { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public int Seats { get; set; }
    public int Doors { get; set; }
    public decimal PricePerDay { get; set; }
    public int Mileage { get; set; }
    public List<string> Features { get; set; } = [];
    public string ImageUrl { get; set; } = string.Empty;
    public string ImageUrlFront { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public VehicleStatus VehicleStatus { get; set; }
}

public enum VehicleCategory
{
    Economy,
    Sedan,
    SUV,
    Truck,
    Luxury,
    Van,
    Electric
}

public enum VehicleStatus
{
    Active,
    Rented,
    Maintenance,
    Retired
}