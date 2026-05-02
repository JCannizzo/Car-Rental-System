using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.Controllers;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Tests.TestInfrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace CarRentalSystem.Server.Tests;

[Collection(PostgresTestCollection.Name)]
public sealed class RatingsControllerTests
{
    private readonly PostgresTestFixture _fixture;

    public RatingsControllerTests(PostgresTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateRating_AllowsOwnerOfCompletedBooking()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var userId = Guid.NewGuid();
        var vehicle = TestData.Vehicle();
        var booking = TestData.Booking(
            vehicle,
            userId: userId,
            guestName: null,
            guestEmail: null,
            status: BookingStatus.Completed,
            paymentStatus: PaymentStatus.Paid);
        context.AddRange(vehicle, booking);
        await context.SaveChangesAsync();

        var controller = new RatingsController(context);
        controller.SetUser(TestData.Customer(userId));

        var response = await controller.CreateRating(new CreateRatingDto
        {
            BookingId = booking.Id,
            Score = 4,
            Comment = "Smooth return",
        });

        var created = response.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var dto = created.Value.Should().BeOfType<RatingDto>().Subject;
        dto.BookingId.Should().Be(booking.Id);
        dto.VehicleId.Should().Be(vehicle.Id);
        dto.UserId.Should().Be(userId);
        dto.Score.Should().Be(4);
        dto.Comment.Should().Be("Smooth return");
    }

    [Theory]
    [InlineData("missing")]
    [InlineData("different-user")]
    [InlineData("incomplete")]
    [InlineData("duplicate")]
    public async Task CreateRating_RejectsInvalidRatingAttempts(string scenario)
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var vehicle = TestData.Vehicle();
        context.Vehicles.Add(vehicle);

        var booking = TestData.Booking(
            vehicle,
            userId: scenario == "different-user" ? otherUserId : userId,
            status: scenario == "incomplete" ? BookingStatus.Confirmed : BookingStatus.Completed,
            paymentStatus: PaymentStatus.Paid);

        if (scenario != "missing")
        {
            context.Bookings.Add(booking);
        }

        if (scenario == "duplicate")
        {
            context.Ratings.Add(TestData.Rating(vehicle, booking, userId));
        }

        await context.SaveChangesAsync();

        var controller = new RatingsController(context);
        controller.SetUser(TestData.Customer(userId));

        var response = await controller.CreateRating(new CreateRatingDto
        {
            BookingId = scenario == "missing" ? Guid.NewGuid() : booking.Id,
            Score = 5,
        });

        switch (scenario)
        {
            case "missing":
                response.Result.Should().BeOfType<NotFoundObjectResult>();
                break;
            case "different-user":
                response.Result.Should().BeOfType<ForbidResult>();
                break;
            case "incomplete":
            case "duplicate":
                response.Result.Should().BeOfType<BadRequestObjectResult>();
                break;
        }
    }

    [Fact]
    public async Task RatingQueries_ReturnPublicUserVehicleAndAverageResults()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var userId = Guid.NewGuid();
        var vehicle = TestData.Vehicle(make: "Mazda", model: "CX-5", year: 2023);
        var firstBooking = TestData.Booking(
            vehicle,
            confirmationCode: "CRS-RATE01",
            userId: userId,
            guestName: null,
            guestEmail: null,
            status: BookingStatus.Completed,
            paymentStatus: PaymentStatus.Paid);
        var secondBooking = TestData.Booking(
            vehicle,
            confirmationCode: "CRS-RATE02",
            userId: Guid.NewGuid(),
            guestName: null,
            guestEmail: null,
            status: BookingStatus.Completed,
            paymentStatus: PaymentStatus.Paid);
        context.AddRange(vehicle, firstBooking, secondBooking);
        context.Ratings.AddRange(
            TestData.Rating(vehicle, firstBooking, userId, score: 5, createdAt: DateTime.UtcNow.AddMinutes(-1)),
            TestData.Rating(vehicle, secondBooking, secondBooking.UserId!.Value, score: 4));
        await context.SaveChangesAsync();

        var controller = new RatingsController(context);
        controller.SetUser(TestData.Customer(userId));

        var all = await controller.GetAllRatings();
        var allOk = all.Result.Should().BeOfType<OkObjectResult>().Subject;
        allOk.Value.Should().BeAssignableTo<List<PublicRatingDto>>()
            .Which.Should().HaveCount(2);

        var mine = await controller.GetMyRatings();
        var mineOk = mine.Result.Should().BeOfType<OkObjectResult>().Subject;
        mineOk.Value.Should().BeAssignableTo<List<RatingDto>>()
            .Which.Should().ContainSingle(r => r.UserId == userId);

        var average = await controller.GetAverageRating(vehicle.Id);
        var averageOk = average.Result.Should().BeOfType<OkObjectResult>().Subject;
        averageOk.Value.Should().Be(4.5d);

        var summary = await controller.GetVehicleRatings(vehicle.Id);
        var summaryOk = summary.Result.Should().BeOfType<OkObjectResult>().Subject;
        var summaryDto = summaryOk.Value.Should().BeOfType<VehicleRatingSummaryDto>().Subject;
        summaryDto.VehicleId.Should().Be(vehicle.Id);
        summaryDto.AverageRating.Should().Be(4.5d);
        summaryDto.TotalRatings.Should().Be(2);
        summaryDto.Ratings.Should().OnlyContain(r => r.VehicleSummary == "2023 Mazda CX-5");

        var missingVehicle = await controller.GetVehicleRatings(Guid.NewGuid());
        missingVehicle.Result.Should().BeOfType<NotFoundObjectResult>();
    }
}
