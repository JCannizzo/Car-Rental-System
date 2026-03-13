using CarRentalSystem.Data.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Data.Contexts;

public class CarRentalSystemDbContext : IdentityDbContext
{
    public CarRentalSystemDbContext(DbContextOptions<CarRentalSystemDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Booking> Bookings { get; set; }
}