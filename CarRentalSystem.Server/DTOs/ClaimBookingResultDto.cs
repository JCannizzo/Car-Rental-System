namespace CarRentalSystem.Server.DTOs;

public class ClaimBookingResultDto
{
    public Guid BookingId { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public bool Claimed { get; set; }
    public string RedirectTo { get; set; } = "/bookings";
}
