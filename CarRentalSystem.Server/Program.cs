using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Server.Extensions;
using CarRentalSystem.Server.Services;
using CarRentalSystem.Server.Services.Interfaces;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.AddNpgsqlDbContext<CarRentalSystemDbContext>("car-rental-system-db");
builder.AddKeycloakAuth();
builder.AddServiceDefaults();
builder.AddRedisClientBuilder("cache")
    .WithOutputCache();

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, ct) =>
    {
        document.Info.Title = "Car Rental System API";
        document.Info.Version = "v1";
        document.Info.Description =
            "REST API for the Car Rental System. Supports searching available vehicles, " +
            "creating and managing bookings, and processing payments. " +
            "Guest bookings are allowed without authentication. " +
            "Authenticated customers can view their booking history.";
        return Task.CompletedTask;
    });
});
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IPaymentService, StripePaymentService>();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
app.UseFileServer();
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapControllers();

app.Run();
