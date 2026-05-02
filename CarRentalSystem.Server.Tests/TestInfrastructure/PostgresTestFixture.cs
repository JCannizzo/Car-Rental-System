using CarRentalSystem.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using Xunit;

namespace CarRentalSystem.Server.Tests.TestInfrastructure;

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class PostgresTestCollection : ICollectionFixture<PostgresTestFixture>
{
    public const string Name = "postgres-tests";
}

public sealed class PostgresTestFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("car_rental_tests")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    public DbContextOptions<CarRentalSystemDbContext> Options { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        Options = new DbContextOptionsBuilder<CarRentalSystemDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .Options;
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }

    public async Task<CarRentalSystemDbContext> CreateCleanContextAsync()
    {
        var context = new CarRentalSystemDbContext(Options);
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        return context;
    }
}
