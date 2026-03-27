using CarRentalSystem.Data.Models;

namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Optional query parameters for filtering the vehicle search results.
/// All fields are optional — omit a field to skip that filter.
/// </summary>
public class VehicleQueryParams
{
    /// <summary>Start of the desired rental period. Vehicles with overlapping bookings are excluded.</summary>
    public DateOnly? StartDate { get; set; }

    /// <summary>End of the desired rental period. Vehicles with overlapping bookings are excluded.</summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>Filter by vehicle category (Economy, Sedan, SUV, Truck, Luxury, Van, Electric).</summary>
    public VehicleCategory? Category { get; set; }

    /// <summary>Filter by transmission type (e.g. "Automatic", "Manual", "CVT").</summary>
    public string? TransmissionType { get; set; }

    /// <summary>Filter by fuel type (e.g. "Petrol", "Diesel", "Hybrid", "Electric").</summary>
    public string? FuelType { get; set; }

    /// <summary>Minimum number of passenger seats required.</summary>
    public int? MinSeats { get; set; }

    /// <summary>Maximum daily rental price in USD.</summary>
    public decimal? MaxPricePerDay { get; set; }

    /// <summary>
    /// Opaque cursor returned from a previous response. Pass this to fetch the next page.
    /// When omitted, results start from the beginning.
    /// </summary>
    public string? Cursor { get; set; }

    /// <summary>Number of results per page (default 20, max 50).</summary>
    public int PageSize { get; set; } = 20;
}
