using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services;
using CarRentalSystem.Server.Tests.TestInfrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace CarRentalSystem.Server.Tests;

[Collection(PostgresTestCollection.Name)]
public sealed class VehicleServiceTests
{
    private readonly PostgresTestFixture _fixture;

    public VehicleServiceTests(PostgresTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetAvailableAsync_FiltersVehiclesAndExcludesOverlappingBookings()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var matching = TestData.Vehicle(
            make: "Ford",
            model: "Explorer",
            category: VehicleCategory.SUV,
            fuelType: "Hybrid",
            seats: 7,
            pricePerDay: 110m,
            licensePlate: "SUV-001");
        var booked = TestData.Vehicle(
            make: "Kia",
            model: "Telluride",
            category: VehicleCategory.SUV,
            fuelType: "Hybrid",
            seats: 7,
            pricePerDay: 95m,
            licensePlate: "SUV-002");
        var wrongCategory = TestData.Vehicle(category: VehicleCategory.Economy, fuelType: "Hybrid", seats: 7, pricePerDay: 70m);
        var maintenance = TestData.Vehicle(status: VehicleStatus.Maintenance, category: VehicleCategory.SUV, fuelType: "Hybrid", seats: 7);
        var start = DateTime.UtcNow.Date.AddDays(8);

        context.Vehicles.AddRange(matching, booked, wrongCategory, maintenance);
        context.Bookings.Add(TestData.Booking(
            booked,
            status: BookingStatus.Confirmed,
            paymentStatus: PaymentStatus.Paid,
            startDate: start,
            endDate: start.AddDays(4)));
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.GetAvailableAsync(new VehicleQueryParams
        {
            Category = VehicleCategory.SUV,
            FuelType = "Hybrid",
            TransmissionType = "Automatic",
            MinSeats = 7,
            MaxPricePerDay = 120m,
            StartDate = DateOnly.FromDateTime(start),
            EndDate = DateOnly.FromDateTime(start.AddDays(2)),
            PageSize = 10,
        });

        result.Items.Should().ContainSingle();
        result.Items[0].Id.Should().Be(matching.Id);
        result.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task GetAvailableAsync_PaginatesByPriceThenIdWithCursor()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var first = TestData.Vehicle(id: Guid.Parse("00000000-0000-0000-0000-000000000001"), pricePerDay: 50m, licensePlate: "PAGE-001");
        var second = TestData.Vehicle(id: Guid.Parse("00000000-0000-0000-0000-000000000002"), pricePerDay: 50m, licensePlate: "PAGE-002");
        var third = TestData.Vehicle(id: Guid.Parse("00000000-0000-0000-0000-000000000003"), pricePerDay: 75m, licensePlate: "PAGE-003");
        context.Vehicles.AddRange(first, second, third);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var pageOne = await service.GetAvailableAsync(new VehicleQueryParams { PageSize = 2 });
        var pageTwo = await service.GetAvailableAsync(new VehicleQueryParams { PageSize = 2, Cursor = pageOne.NextCursor });

        pageOne.Items.Select(v => v.Id).Should().Equal(first.Id, second.Id);
        pageOne.HasMore.Should().BeTrue();
        pageOne.NextCursor.Should().NotBeNullOrWhiteSpace();
        pageTwo.Items.Select(v => v.Id).Should().Equal(third.Id);
        pageTwo.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task GetAdminInventoryAsync_SearchesFiltersSortsAndClampsPageSize()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var civic = TestData.Vehicle(make: "Honda", model: "Civic", category: VehicleCategory.Sedan, pricePerDay: 45m, licensePlate: "SED-001");
        var camry = TestData.Vehicle(make: "Toyota", model: "Camry", category: VehicleCategory.Sedan, pricePerDay: 65m, licensePlate: "SED-002");
        var truck = TestData.Vehicle(make: "Ford", model: "F-150", category: VehicleCategory.Truck, pricePerDay: 95m, licensePlate: "TRK-001");
        context.Vehicles.AddRange(civic, camry, truck);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.GetAdminInventoryAsync(new AdminVehicleQueryParams
        {
            Search = "sed",
            Category = "Sedan",
            Status = "Available",
            SortBy = "rate",
            SortDirection = "desc",
            PageSize = 500,
        });

        result.Items.Select(v => v.Id).Should().Equal(camry.Id, civic.Id);
        result.TotalCount.Should().Be(2);
        result.HasMore.Should().BeFalse();

        await service.Invoking(s => s.GetAdminInventoryAsync(new AdminVehicleQueryParams { SortBy = "unsupported" }))
            .Should().ThrowAsync<ArgumentException>();
        await service.Invoking(s => s.GetAdminInventoryAsync(new AdminVehicleQueryParams { Category = "Spaceship" }))
            .Should().ThrowAsync<ArgumentException>();
        await service.Invoking(s => s.GetAdminInventoryAsync(new AdminVehicleQueryParams { Status = "Lost" }))
            .Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateUpdateStatusAndDeleteAsync_ManageVehicleState()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var service = CreateService(context);

        var created = await service.CreateAsync(new VehicleUpsertDto
        {
            Make = "  Tesla ",
            Model = " Model Y ",
            Year = 2025,
            Category = "Electric",
            Transmission = " Automatic ",
            FuelType = " Electric ",
            Seats = 5,
            Doors = 4,
            PricePerDay = 140m,
            Mileage = 1_200,
            Features = [" Heated Seats ", "heated seats", "", " Autopilot "],
            ImageUrl = " https://example.test/tesla-side.png ",
            ImageUrlFront = " https://example.test/tesla-front.png ",
            LicensePlate = " EV-001 ",
            Status = "active",
        });

        created.Make.Should().Be("Tesla");
        created.Model.Should().Be("Model Y");
        created.Features.Should().Equal("Heated Seats", "Autopilot");
        created.Status.Should().Be("available");

        var updated = await service.UpdateAsync(created.Id, new VehicleUpsertDto
        {
            Make = "Tesla",
            Model = "Model 3",
            Year = 2024,
            Category = "Electric",
            Transmission = "Automatic",
            FuelType = "Electric",
            Seats = 5,
            Doors = 4,
            PricePerDay = 125m,
            Mileage = 2_000,
            Features = ["Glass Roof"],
            ImageUrl = "side",
            ImageUrlFront = "front",
            LicensePlate = "EV-002",
            Status = "Maintenance",
        });

        updated.Should().NotBeNull();
        updated!.Model.Should().Be("Model 3");
        updated.Status.Should().Be("maintenance");

        var status = await service.UpdateStatusAsync(created.Id, "Available");
        status!.Status.Should().Be("available");

        (await service.DeleteAsync(created.Id)).Should().BeTrue();
        (await context.Vehicles.AnyAsync()).Should().BeFalse();
        (await service.DeleteAsync(created.Id)).Should().BeFalse();
    }

    private static VehicleService CreateService(CarRentalSystem.Data.Contexts.CarRentalSystemDbContext context)
    {
        return new VehicleService(context, Substitute.For<ILogger<VehicleService>>());
    }
}
