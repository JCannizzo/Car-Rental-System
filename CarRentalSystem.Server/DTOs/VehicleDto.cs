namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Represents a vehicle available for rental.
/// </summary>
public class VehicleDto
{
    /// <summary>Unique identifier for the vehicle.</summary>
    public Guid Id { get; set; }

    /// <summary>Vehicle manufacturer (e.g. "Toyota", "BMW").</summary>
    public string Make { get; set; } = string.Empty;

    /// <summary>Vehicle model name (e.g. "Camry", "X5").</summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>Model year of the vehicle.</summary>
    public int Year { get; set; }

    /// <summary>Vehicle category — Economy, Sedan, SUV, Truck, Luxury, Van, or Electric.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Transmission type (e.g. "Automatic", "Manual", "CVT").</summary>
    public string Transmission { get; set; } = string.Empty;

    /// <summary>Fuel type (e.g. "Petrol", "Diesel", "Hybrid", "Electric").</summary>
    public string FuelType { get; set; } = string.Empty;

    /// <summary>Number of passenger seats.</summary>
    public int Seats { get; set; }

    /// <summary>Number of doors.</summary>
    public int Doors { get; set; }

    /// <summary>Daily rental price in USD.</summary>
    public decimal PricePerDay { get; set; }

    /// <summary>Current odometer reading in miles.</summary>
    public int Mileage { get; set; }

    /// <summary>List of vehicle features (e.g. "Bluetooth", "Backup Camera", "Heated Seats").</summary>
    public List<string> Features { get; set; } = [];

    /// <summary>URL for the side-view image of the vehicle.</summary>
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>URL for the front-view image of the vehicle.</summary>
    public string ImageUrlFront { get; set; } = string.Empty;
}
