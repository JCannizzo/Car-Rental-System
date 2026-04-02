using Microsoft.AspNetCore.Mvc;
using CarRentalSystem.Server.Models;

namespace CarRentalSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingsController : ControllerBase
    {
        private static List<Rating> ratings = new List<Rating>();

        [HttpPost]
        public IActionResult AddRating([FromBody] Rating rating)
        {
            if (rating == null)
                return BadRequest("Invalid rating data");

            if (rating.VehicleId <= 0)
                return BadRequest("VehicleId must be greater than 0");

            if (rating.Score < 1 || rating.Score > 5)
                return BadRequest("Rating must be between 1 and 5");

            ratings.Add(rating);
            return Ok("Rating added");
        }

        [HttpGet("{vehicleId}")]
        public IActionResult GetRatingsForVehicle(int vehicleId)
        {
            if (vehicleId <= 0)
                return BadRequest("Invalid vehicle ID");

            var vehicleRatings = ratings.Where(r => r.VehicleId == vehicleId).ToList();

            if (!vehicleRatings.Any())
                return NotFound("No ratings found for this vehicle");

            return Ok(vehicleRatings);
        }

        [HttpGet("average/{vehicleId}")]
        public IActionResult GetAverageRating(int vehicleId)
        {
            if (vehicleId <= 0)
                return BadRequest("Invalid vehicle ID");

            var vehicleRatings = ratings.Where(r => r.VehicleId == vehicleId).ToList();

            if (!vehicleRatings.Any())
                return NotFound("No ratings found for this vehicle");

            var avg = vehicleRatings.Average(r => r.Score);
            return Ok(avg);
        }
    }
}