using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Server.Extensions;
using CarRentalSystem.Server.Services;
using CarRentalSystem.Server.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.AddNpgsqlDbContext<CarRentalSystemDbContext>("car-rental-system-db");
builder.AddKeycloakAuth();
builder.AddServiceDefaults();
builder.AddRedisClientBuilder("cache")
    .WithOutputCache();

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IVehicleService, VehicleService>();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseFileServer();
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapControllers();

app.Run();
