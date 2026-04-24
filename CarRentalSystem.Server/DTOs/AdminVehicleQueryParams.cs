namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// Query parameters for the admin inventory table.
/// </summary>
public class AdminVehicleQueryParams
{
    /// <summary>One-based page number.</summary>
    public int Page { get; set; } = 1;

    /// <summary>Number of vehicles per page (default 15, max 50).</summary>
    public int PageSize { get; set; } = 15;

    /// <summary>Search make, model, year, category, plate, status, transmission, or fuel type.</summary>
    public string? Search { get; set; }

    /// <summary>Filter by vehicle category.</summary>
    public string? Category { get; set; }

    /// <summary>Filter by vehicle status.</summary>
    public string? Status { get; set; }

    /// <summary>Sort field: vehicle, category, plate, status, mileage, rate, or specs.</summary>
    public string? SortBy { get; set; } = "vehicle";

    /// <summary>Sort direction: asc or desc.</summary>
    public string? SortDirection { get; set; } = "asc";
}
