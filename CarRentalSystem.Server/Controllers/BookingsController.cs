using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "CustomerOnly")]
    public IActionResult GetBookings()
    {
        return Ok("auth works!");
    }
}