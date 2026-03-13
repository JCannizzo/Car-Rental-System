using CarRentalSystem.Data.Models;

namespace CarRentalSystem.Server.DTOs;

public class VehicleQueryParams
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public VehicleCategory? Category { get; set; }
    public string? TransmissionType { get; set; }
    public string? FuelType { get; set; }
    public int? MinSeats { get; set; }
    public decimal? MaxPricePerDay { get; set; }
}