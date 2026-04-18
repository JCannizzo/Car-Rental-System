using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

public class ClaimBookingDto
{
    [Required]
    public string ConfirmationCode { get; set; } = string.Empty;
}
