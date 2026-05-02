using System.Security.Claims;
using CarRentalSystem.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Tests.TestInfrastructure;

public static class TestData
{
    public static Vehicle Vehicle(
        Guid? id = null,
        string make = "Toyota",
        string model = "Camry",
        int year = 2024,
        VehicleCategory category = VehicleCategory.Sedan,
        string transmission = "Automatic",
        string fuelType = "Gasoline",
        int seats = 5,
        decimal pricePerDay = 75m,
        VehicleStatus status = VehicleStatus.Available,
        string licensePlate = "TEST-001",
        int mileage = 10_000)
    {
        return new Vehicle
        {
            Id = id ?? Guid.NewGuid(),
            Make = make,
            Model = model,
            Year = year,
            Category = category,
            Transmission = transmission,
            FuelType = fuelType,
            Seats = seats,
            Doors = 4,
            PricePerDay = pricePerDay,
            Mileage = mileage,
            Features = ["Bluetooth", "Backup Camera"],
            ImageUrl = "https://example.test/side.png",
            ImageUrlFront = "https://example.test/front.png",
            LicensePlate = licensePlate,
            VehicleStatus = status,
        };
    }

    public static Booking Booking(
        Vehicle vehicle,
        Guid? id = null,
        string confirmationCode = "CRS-ABC123",
        Guid? userId = null,
        string? guestName = "Guest Driver",
        string? guestEmail = "guest@example.com",
        BookingStatus status = BookingStatus.Pending,
        PaymentStatus paymentStatus = PaymentStatus.Unpaid,
        DateTime? startDate = null,
        DateTime? endDate = null,
        DateTime? createdAt = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date.AddDays(7);
        var end = endDate ?? start.AddDays(3);

        return new Booking
        {
            Id = id ?? Guid.NewGuid(),
            ConfirmationCode = confirmationCode,
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            UserId = userId,
            GuestName = guestName,
            GuestEmail = guestEmail,
            GuestPhone = "555-1234",
            StartDate = DateTime.SpecifyKind(start.Date, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(end.Date, DateTimeKind.Utc),
            TotalPrice = (end.Date - start.Date).Days * vehicle.PricePerDay,
            Status = status,
            PaymentStatus = paymentStatus,
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
    }

    public static Rating Rating(
        Vehicle vehicle,
        Booking booking,
        Guid userId,
        int score = 5,
        string? comment = "Great rental",
        DateTime? createdAt = null)
    {
        return new Rating
        {
            Id = Guid.NewGuid(),
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            BookingId = booking.Id,
            Booking = booking,
            UserId = userId,
            Score = score,
            Comment = comment,
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
    }

    public static ClaimsPrincipal Customer(Guid userId, string email = "customer@example.com")
    {
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
            ],
            "TestAuth");

        return new ClaimsPrincipal(identity);
    }

    public static void SetUser(this ControllerBase controller, ClaimsPrincipal user)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user },
        };
    }
}
