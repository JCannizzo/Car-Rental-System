using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

public class VehicleUpsertDto
{
    [Required]
    public string Make { get; set; } = string.Empty;

    [Required]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 3000)]
    public int Year { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Transmission { get; set; } = string.Empty;

    [Required]
    public string FuelType { get; set; } = string.Empty;

    [Range(1, 20)]
    public int Seats { get; set; }

    [Range(1, 10)]
    public int Doors { get; set; }

    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal PricePerDay { get; set; }

    [Range(0, int.MaxValue)]
    public int Mileage { get; set; }

    public List<string> Features { get; set; } = [];

    public string ImageUrl { get; set; } = string.Empty;

    public string ImageUrlFront { get; set; } = string.Empty;

    [Required]
    public string LicensePlate { get; set; } = string.Empty;

    [Required]
    public string Status { get; set; } = string.Empty;
}
