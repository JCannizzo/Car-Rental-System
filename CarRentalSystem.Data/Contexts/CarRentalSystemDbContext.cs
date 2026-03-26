using CarRentalSystem.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Data.Contexts;

public class CarRentalSystemDbContext : DbContext
{
    public CarRentalSystemDbContext(DbContextOptions<CarRentalSystemDbContext> options) : base(options)
    {
    }
    
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(b => b.ConfirmationCode)
                .IsUnique();

            entity.HasIndex(b => b.StripeSessionId)
                .IsUnique()
                .HasFilter("\"StripeSessionId\" IS NOT NULL");
        });
    }
}
