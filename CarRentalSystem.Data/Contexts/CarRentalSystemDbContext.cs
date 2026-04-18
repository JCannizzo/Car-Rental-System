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
    public DbSet<Rating> Ratings { get; set; }
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
        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasOne(r => r.Vehicle)
                .WithMany()
                .HasForeignKey(r => r.VehicleId);
            entity.HasOne(r => r.Booking)
                .WithMany()
                .HasForeignKey(r => r.BookingId);
            entity.HasIndex(r => r.BookingId)
                .IsUnique(); // one rating per booking
        });
    }
}