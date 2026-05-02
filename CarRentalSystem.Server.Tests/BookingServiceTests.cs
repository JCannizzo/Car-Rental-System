using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.DTOs;
using CarRentalSystem.Server.Services;
using CarRentalSystem.Server.Services.Interfaces;
using CarRentalSystem.Server.Tests.TestInfrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace CarRentalSystem.Server.Tests;

[Collection(PostgresTestCollection.Name)]
public sealed class BookingServiceTests
{
    private readonly PostgresTestFixture _fixture;

    public BookingServiceTests(PostgresTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateBookingAsync_CreatesPendingGuestBookingWithCheckoutUrl()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle(pricePerDay: 90m);
        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();

        var service = CreateService(context, out var paymentService);
        paymentService.CreateCheckoutSessionAsync(Arg.Any<Booking>(), "https://frontend.test")
            .Returns("https://checkout.test/session");

        var start = DateTime.UtcNow.Date.AddDays(5);
        var result = await service.CreateBookingAsync(
            new CreateBookingDto
            {
                VehicleId = vehicle.Id,
                StartDate = start.AddHours(13),
                EndDate = start.AddDays(3).AddHours(9),
                GuestName = "  Ada Lovelace  ",
                GuestEmail = "ada@example.com",
                GuestPhone = "555-9876",
            },
            userId: null,
            frontendBaseUrl: "https://frontend.test");

        result.BookingId.Should().NotBeEmpty();
        result.ConfirmationCode.Should().MatchRegex("^CRS-[A-Z2-9]{6}$");
        result.VehicleSummary.Should().Be("2024 Toyota Camry");
        result.StartDate.Should().Be(DateTime.SpecifyKind(start, DateTimeKind.Utc));
        result.EndDate.Should().Be(DateTime.SpecifyKind(start.AddDays(3), DateTimeKind.Utc));
        result.TotalPrice.Should().Be(270m);
        result.Status.Should().Be(nameof(BookingStatus.Pending));
        result.PaymentStatus.Should().Be(nameof(PaymentStatus.Unpaid));
        result.CheckoutUrl.Should().Be("https://checkout.test/session");

        var saved = await context.Bookings.SingleAsync();
        saved.UserId.Should().BeNull();
        saved.GuestName.Should().Be("  Ada Lovelace  ");
        saved.GuestEmail.Should().Be("ada@example.com");
        saved.GuestPhone.Should().Be("555-9876");
    }

    [Theory]
    [InlineData("missing-vehicle")]
    [InlineData("unavailable-vehicle")]
    [InlineData("same-day-return")]
    [InlineData("past-start")]
    [InlineData("active-overlap")]
    public async Task CreateBookingAsync_RejectsInvalidBookingRequests(string scenario)
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle(status: scenario == "unavailable-vehicle" ? VehicleStatus.Maintenance : VehicleStatus.Available);
        context.Vehicles.Add(vehicle);

        var start = DateTime.UtcNow.Date.AddDays(5);
        if (scenario == "active-overlap")
        {
            context.Bookings.Add(TestData.Booking(
                vehicle,
                status: BookingStatus.Confirmed,
                paymentStatus: PaymentStatus.Paid,
                startDate: start,
                endDate: start.AddDays(4)));
        }

        await context.SaveChangesAsync();

        var dto = new CreateBookingDto
        {
            VehicleId = scenario == "missing-vehicle" ? Guid.NewGuid() : vehicle.Id,
            StartDate = scenario == "past-start" ? DateTime.UtcNow.Date.AddDays(-1) : start,
            EndDate = scenario == "same-day-return" ? start : start.AddDays(2),
            GuestName = "Guest",
            GuestEmail = "guest@example.com",
        };

        var service = CreateService(context);
        var act = () => service.CreateBookingAsync(dto, null, "https://frontend.test");

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CreateBookingAsync_AllowsOverlapsForCancelledAndStalePendingBookings()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        var start = DateTime.UtcNow.Date.AddDays(10);

        context.Vehicles.Add(vehicle);
        context.Bookings.AddRange(
            TestData.Booking(
                vehicle,
                confirmationCode: "CRS-CANCEL",
                status: BookingStatus.Cancelled,
                startDate: start,
                endDate: start.AddDays(2)),
            TestData.Booking(
                vehicle,
                confirmationCode: "CRS-STALE1",
                status: BookingStatus.Pending,
                createdAt: DateTime.UtcNow.AddMinutes(-11),
                startDate: start,
                endDate: start.AddDays(2)));
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.CreateBookingAsync(
            new CreateBookingDto
            {
                VehicleId = vehicle.Id,
                StartDate = start,
                EndDate = start.AddDays(2),
                GuestName = "Guest",
                GuestEmail = "guest@example.com",
            },
            null,
            "https://frontend.test");

        result.Status.Should().Be(nameof(BookingStatus.Pending));
    }

    [Fact]
    public async Task GetBookingByConfirmationCodeAsync_NormalizesCode()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        context.AddRange(vehicle, TestData.Booking(vehicle, confirmationCode: "CRS-LOOKUP"));
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var result = await service.GetBookingByConfirmationCodeAsync("  crs-lookup ");

        result.Should().NotBeNull();
        result!.ConfirmationCode.Should().Be("CRS-LOOKUP");
        result.VehicleSummary.Should().Be("2024 Toyota Camry");
    }

    [Fact]
    public async Task ClaimGuestBookingAsync_AttachesPaidBookingToMatchingUser()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        var booking = TestData.Booking(
            vehicle,
            confirmationCode: "CRS-CLAIM1",
            status: BookingStatus.Confirmed,
            paymentStatus: PaymentStatus.Paid,
            guestEmail: "guest@example.com");
        context.AddRange(vehicle, booking);
        await context.SaveChangesAsync();

        var userId = Guid.NewGuid();
        var service = CreateService(context);
        var result = await service.ClaimGuestBookingAsync("crs-claim1", userId, " guest@example.com ");

        result.Claimed.Should().BeTrue();
        result.RedirectTo.Should().Be("/bookings");

        var saved = await context.Bookings.SingleAsync();
        saved.UserId.Should().Be(userId);
    }

    [Theory]
    [InlineData("missing")]
    [InlineData("unpaid")]
    [InlineData("cancelled")]
    [InlineData("wrong-email")]
    [InlineData("already-linked")]
    public async Task ClaimGuestBookingAsync_RejectsIneligibleClaims(string scenario)
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        context.Vehicles.Add(vehicle);

        var confirmationCode = "CRS-CLAIM2";
        if (scenario != "missing")
        {
            context.Bookings.Add(TestData.Booking(
                vehicle,
                confirmationCode: confirmationCode,
                userId: scenario == "already-linked" ? Guid.NewGuid() : null,
                status: scenario == "cancelled" ? BookingStatus.Cancelled : BookingStatus.Confirmed,
                paymentStatus: scenario == "unpaid" ? PaymentStatus.Unpaid : PaymentStatus.Paid,
                guestEmail: "guest@example.com"));
        }

        await context.SaveChangesAsync();

        var email = scenario == "wrong-email" ? "someoneelse@example.com" : "guest@example.com";
        var service = CreateService(context);
        var act = () => service.ClaimGuestBookingAsync(confirmationCode, Guid.NewGuid(), email);

        await act.Should().ThrowAsync<BookingClaimException>();
    }

    [Fact]
    public async Task CancelBookingAsync_CancelsActiveBookingButRejectsMissingOrAlreadyCancelledBookings()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        context.AddRange(
            vehicle,
            TestData.Booking(vehicle, confirmationCode: "CRS-CANCEL", status: BookingStatus.Confirmed),
            TestData.Booking(vehicle, confirmationCode: "CRS-DONE00", status: BookingStatus.Cancelled));
        await context.SaveChangesAsync();

        var service = CreateService(context);

        (await service.CancelBookingAsync("crs-cancel")).Should().BeTrue();
        (await service.CancelBookingAsync("crs-done00")).Should().BeFalse();
        (await service.CancelBookingAsync("missing")).Should().BeFalse();

        var cancelled = await context.Bookings.SingleAsync(b => b.ConfirmationCode == "CRS-CANCEL");
        cancelled.Status.Should().Be(BookingStatus.Cancelled);
    }

    [Fact]
    public async Task UpdateBookingStatusAsync_EnforcesAdminStatusRules()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle();
        var unpaid = TestData.Booking(vehicle, confirmationCode: "CRS-UNPAID", paymentStatus: PaymentStatus.Unpaid);
        var completed = TestData.Booking(vehicle, confirmationCode: "CRS-CMPLTD", status: BookingStatus.Completed, paymentStatus: PaymentStatus.Paid);
        var paid = TestData.Booking(vehicle, confirmationCode: "CRS-PAID00", status: BookingStatus.Pending, paymentStatus: PaymentStatus.Paid);
        context.AddRange(vehicle, unpaid, completed, paid);
        await context.SaveChangesAsync();

        var service = CreateService(context);

        await service.Invoking(s => s.UpdateBookingStatusAsync(unpaid.Id, "Confirmed"))
            .Should().ThrowAsync<InvalidOperationException>();
        await service.Invoking(s => s.UpdateBookingStatusAsync(completed.Id, "Cancelled"))
            .Should().ThrowAsync<InvalidOperationException>();

        var updated = await service.UpdateBookingStatusAsync(paid.Id, "Confirmed");
        updated.Should().NotBeNull();
        updated!.Status.Should().Be(nameof(BookingStatus.Confirmed));
    }

    [Fact]
    public async Task ReturnBookingAsync_CompletesBookingAndUpdatesVehicle()
    {
        await using var context = await _fixture.CreateCleanContextAsync();
        var vehicle = TestData.Vehicle(mileage: 25_000, status: VehicleStatus.Rented);
        var booking = TestData.Booking(vehicle, status: BookingStatus.Confirmed, paymentStatus: PaymentStatus.Paid);
        context.AddRange(vehicle, booking);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var returned = await service.ReturnBookingAsync(
            booking.Id,
            new ReturnBookingDto { VehicleStatus = "Maintenance", Mileage = 25_250, Notes = "Needs cleaning" });

        returned.Should().NotBeNull();
        returned!.Status.Should().Be(nameof(BookingStatus.Completed));
        returned.VehicleStatus.Should().Be("maintenance");
        returned.VehicleMileage.Should().Be(25_250);

        await service.Invoking(s => s.ReturnBookingAsync(booking.Id, new ReturnBookingDto { Mileage = 25_100 }))
            .Should().ThrowAsync<InvalidOperationException>();
    }

    private static BookingService CreateService(CarRentalSystem.Data.Contexts.CarRentalSystemDbContext context)
    {
        return CreateService(context, out _);
    }

    private static BookingService CreateService(
        CarRentalSystem.Data.Contexts.CarRentalSystemDbContext context,
        out IPaymentService paymentService)
    {
        paymentService = Substitute.For<IPaymentService>();
        paymentService.CreateCheckoutSessionAsync(Arg.Any<Booking>(), Arg.Any<string>())
            .Returns("https://checkout.test/default");

        return new BookingService(
            context,
            paymentService,
            Substitute.For<ILogger<BookingService>>());
    }
}
