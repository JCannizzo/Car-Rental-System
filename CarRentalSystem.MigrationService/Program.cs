using CarRentalSystem.Data.Contexts;
using CarRentalSystem.MigrationService;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<MigrationWorker>();

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(MigrationWorker.ActivitySourceName));

builder.AddNpgsqlDbContext<CarRentalSystemDbContext>("car-rental-system-db");

var host = builder.Build();
host.Run();