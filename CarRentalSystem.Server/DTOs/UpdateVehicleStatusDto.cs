using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.Server.DTOs;

public class UpdateVehicleStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
