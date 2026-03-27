namespace CarRentalSystem.Server.DTOs;

/// <summary>
/// A cursor-based paginated response wrapper.
/// </summary>
/// <typeparam name="T">The type of items in the result set.</typeparam>
public class PaginatedResult<T>
{
    /// <summary>The items for the current page.</summary>
    public List<T> Items { get; set; } = [];

    /// <summary>
    /// Opaque cursor to fetch the next page. Null when there are no more results.
    /// Pass this value as the <c>Cursor</c> query parameter in the next request.
    /// </summary>
    public string? NextCursor { get; set; }

    /// <summary>Whether more results exist beyond this page.</summary>
    public bool HasMore { get; set; }

    /// <summary>Total number of items matching the current filters (ignoring pagination).</summary>
    public int TotalCount { get; set; }
}
