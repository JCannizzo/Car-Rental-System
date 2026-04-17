namespace CarRentalSystem.Server.Services;

public class BookingClaimException : Exception
{
    public BookingClaimException(int statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
