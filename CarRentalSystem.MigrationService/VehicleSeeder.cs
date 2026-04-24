using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.MigrationService;

public static class VehicleSeeder
{
    public static async Task SeedAsync(CarRentalSystemDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Vehicles.AnyAsync(cancellationToken))
            return;

        var vehicles = new List<Vehicle>();
        vehicles.AddRange(GetEconomyVehicles());
        vehicles.AddRange(GetSedanVehicles());
        vehicles.AddRange(GetSuvVehicles());
        vehicles.AddRange(GetTruckVehicles());
        vehicles.AddRange(GetLuxuryVehicles());
        vehicles.AddRange(GetVanVehicles());
        vehicles.AddRange(GetElectricVehicles());

        await dbContext.Vehicles.AddRangeAsync(vehicles, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
    // This Data is generated using AI.
    private static string Img(string make, string model, string color = "colourWhite", string angle = "side")
        => $"https://cdn.imagin.studio/getimage?customer=img&make={make}&modelFamily={model}&paintId={color}&angle={angle}";

    // ── Economy ──────────────────────────────────────────────────────────────
    private static List<Vehicle> GetEconomyVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Fit", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 33,
            Mileage = 22000, LicensePlate = "ECO-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Fuel Efficient", "Compact"],
            ImageUrl = Img("honda", "fit"), ImageUrlFront = Img("honda", "fit", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Yaris", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 35,
            Mileage = 18000, LicensePlate = "ECO-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Backup Camera", "USB Charging"],
            ImageUrl = Img("toyota", "yaris"), ImageUrlFront = Img("toyota", "yaris", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Rio", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 31,
            Mileage = 9000, LicensePlate = "ECO-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Apple CarPlay", "Android Auto"],
            ImageUrl = Img("kia", "rio"), ImageUrlFront = Img("kia", "rio", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "Mazda2", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 33,
            Mileage = 15000, LicensePlate = "ECO-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Blind Spot Monitoring", "Backup Camera"],
            ImageUrl = Img("mazda", "mazda2"), ImageUrlFront = Img("mazda", "mazda2", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Versa", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 32,
            Mileage = 12000, LicensePlate = "ECO-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Lane Departure Warning", "USB Charging"],
            ImageUrl = Img("nissan", "versa"), ImageUrlFront = Img("nissan", "versa", angle: "front") },

    ];

    // ── Sedan ────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetSedanVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Accord", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 57,
            Mileage = 6000, LicensePlate = "SED-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Honda Sensing", "Wireless CarPlay", "Heated Seats"],
            ImageUrl = Img("honda", "accord"), ImageUrlFront = Img("honda", "accord", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Camry", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 55,
            Mileage = 8000, LicensePlate = "SED-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Apple CarPlay", "Backup Camera", "Adaptive Cruise Control"],
            ImageUrl = Img("toyota", "camry"), ImageUrlFront = Img("toyota", "camry", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "K5", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 55,
            Mileage = 5000, LicensePlate = "SED-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Kia Drive Wise", "Panoramic Sunroof", "Wireless Charging"],
            ImageUrl = Img("kia", "k5"), ImageUrlFront = Img("kia", "k5", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "Mazda6", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 54,
            Mileage = 14000, LicensePlate = "SED-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Bose Audio", "Heated Seats", "Blind Spot Monitoring"],
            ImageUrl = Img("mazda", "mazda6"), ImageUrlFront = Img("mazda", "mazda6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Altima", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 52,
            Mileage = 10000, LicensePlate = "SED-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "ProPilot Assist", "Android Auto", "Backup Camera"],
            ImageUrl = Img("nissan", "altima"), ImageUrlFront = Img("nissan", "altima", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "ES", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 62,
            Mileage = 7000, LicensePlate = "SED-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Lexus Safety System+", "Mark Levinson Audio", "Hybrid"],
            ImageUrl = Img("lexus", "es"), ImageUrlFront = Img("lexus", "es", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "3 Series", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 65,
            Mileage = 8000, LicensePlate = "SED-007", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "BMW Live Cockpit", "Heated Seats", "Parking Assistant"],
            ImageUrl = Img("bmw", "3-series"), ImageUrlFront = Img("bmw", "3-series", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Sonata", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 53,
            Mileage = 11000, LicensePlate = "SED-008", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Lane Keeping Assist", "Smart Cruise Control", "Sunroof"],
            ImageUrl = Img("hyundai", "sonata"), ImageUrlFront = Img("hyundai", "sonata", angle: "front") },
    ];

    // ── SUV ──────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetSuvVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "CR-V", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 73,
            Mileage = 7000, LicensePlate = "SUV-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Honda Sensing", "Panoramic Roof", "Wireless CarPlay"],
            ImageUrl = Img("honda", "cr-v"), ImageUrlFront = Img("honda", "cr-v", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "RAV4", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 75,
            Mileage = 9000, LicensePlate = "SUV-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "AWD", "Hybrid", "Toyota Safety Sense", "Backup Camera"],
            ImageUrl = Img("toyota", "rav4"), ImageUrlFront = Img("toyota", "rav4", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Sportage", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 71,
            Mileage = 5000, LicensePlate = "SUV-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Kia Drive Wise", "Panoramic Display", "Heated Seats"],
            ImageUrl = Img("kia", "sportage"), ImageUrlFront = Img("kia", "sportage", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "CX-5", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 70,
            Mileage = 11000, LicensePlate = "SUV-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "i-Activsense", "Bose Audio", "AWD"],
            ImageUrl = Img("mazda", "cx-5"), ImageUrlFront = Img("mazda", "cx-5", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Rogue", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 69,
            Mileage = 8000, LicensePlate = "SUV-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "ProPilot Assist", "3-Zone Climate", "Panoramic Moonroof"],
            ImageUrl = Img("nissan", "rogue"), ImageUrlFront = Img("nissan", "rogue", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Escape", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 68,
            Mileage = 12000, LicensePlate = "SUV-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "SYNC 4", "Blind Spot Info System", "Backup Camera"],
            ImageUrl = Img("ford", "escape"), ImageUrlFront = Img("ford", "escape", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "GLE", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 95,
            Mileage = 6000, LicensePlate = "SUV-007", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "MBUX", "Burmester Audio", "4MATIC AWD", "Heated Seats"],
            ImageUrl = Img("mercedes-benz", "gle"), ImageUrlFront = Img("mercedes-benz", "gle", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "X3", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 82,
            Mileage = 9000, LicensePlate = "SUV-008", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "BMW Live Cockpit", "xDrive AWD", "Heated Seats", "Panoramic Roof"],
            ImageUrl = Img("bmw", "x3"), ImageUrlFront = Img("bmw", "x3", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "RX", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 88,
            Mileage = 7000, LicensePlate = "SUV-009", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Lexus Safety System+", "Mark Levinson Audio", "Hybrid AWD"],
            ImageUrl = Img("lexus", "rx"), ImageUrlFront = Img("lexus", "rx", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Tucson", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 72,
            Mileage = 6000, LicensePlate = "SUV-010", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Hyundai SmartSense", "Panoramic Sunroof", "Wireless Charging"],
            ImageUrl = Img("hyundai", "tucson"), ImageUrlFront = Img("hyundai", "tucson", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "CX-90", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 7, Doors = 4, PricePerDay = 85,
            Mileage = 4000, LicensePlate = "SUV-011", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "i-Activsense", "Panoramic Moonroof", "7-Seat", "Nappa Leather"],
            ImageUrl = Img("mazda", "cx-90"), ImageUrlFront = Img("mazda", "cx-90", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R1S", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Electric", Seats = 7, Doors = 4, PricePerDay = 160,
            Mileage = 5000, LicensePlate = "SUV-012", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "316mi Range", "Quad Motor AWD", "7-Seat", "Gear Guard Security"],
            ImageUrl = Img("rivian", "r1s"), ImageUrlFront = Img("rivian", "r1s", angle: "front") },
    ];

    // ── Truck ────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetTruckVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "F-150", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 95,
            Mileage = 8000, LicensePlate = "TRK-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "SYNC 4", "Tow Package", "Bed Liner", "4WD"],
            ImageUrl = Img("ford", "f-150"), ImageUrlFront = Img("ford", "f-150", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Tacoma", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 88,
            Mileage = 10000, LicensePlate = "TRK-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Toyota Safety Sense", "4WD", "Off-Road Package"],
            ImageUrl = Img("toyota", "tacoma"), ImageUrlFront = Img("toyota", "tacoma", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Ridgeline", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 85,
            Mileage = 9000, LicensePlate = "TRK-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Honda Sensing", "In-Bed Trunk", "AWD", "Apple CarPlay"],
            ImageUrl = Img("honda", "ridgeline"), ImageUrlFront = Img("honda", "ridgeline", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Frontier", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 82,
            Mileage = 7000, LicensePlate = "TRK-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "4WD", "Bed Liner", "Tow Package", "Apple CarPlay"],
            ImageUrl = Img("nissan", "frontier"), ImageUrlFront = Img("nissan", "frontier", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Ranger", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 80,
            Mileage = 6000, LicensePlate = "TRK-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "SYNC 4", "4WD", "FX4 Off-Road Package"],
            ImageUrl = Img("ford", "ranger"), ImageUrlFront = Img("ford", "ranger", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Santa Cruz", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 78,
            Mileage = 8000, LicensePlate = "TRK-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Hyundai SmartSense", "AWD", "Lockable Bed", "Wireless Charging"],
            ImageUrl = Img("hyundai", "santa-cruz"), ImageUrlFront = Img("hyundai", "santa-cruz", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R1T", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 175,
            Mileage = 3000, LicensePlate = "TRK-007", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "314mi Range", "Quad Motor AWD", "Camp Kitchen", "Gear Tunnel"],
            ImageUrl = Img("rivian", "r1t"), ImageUrlFront = Img("rivian", "r1t", angle: "front") },
    ];

    // ── Luxury ───────────────────────────────────────────────────────────────
    private static List<Vehicle> GetLuxuryVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "5 Series", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 150,
            Mileage = 5000, LicensePlate = "LUX-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "BMW Live Cockpit", "Heated Seats", "Harman Kardon Audio", "Heads-Up Display"],
            ImageUrl = Img("bmw", "5-series"), ImageUrlFront = Img("bmw", "5-series", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "7 Series", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 200,
            Mileage = 4000, LicensePlate = "LUX-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Executive Lounge", "Bowers & Wilkins Audio", "Massage Seats", "Sky Lounge Roof"],
            ImageUrl = Img("bmw", "7-series"), ImageUrlFront = Img("bmw", "7-series", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "E-Class", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 160,
            Mileage = 4000, LicensePlate = "LUX-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "MBUX", "Burmester Audio", "Heated & Ventilated Seats", "Panoramic Roof"],
            ImageUrl = Img("mercedes-benz", "e-class"), ImageUrlFront = Img("mercedes-benz", "e-class", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "S-Class", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 220,
            Mileage = 3000, LicensePlate = "LUX-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "MBUX Hyperscreen", "4D Burmester Audio", "Rear Executive Seats", "AR Navigation"],
            ImageUrl = Img("mercedes-benz", "s-class"), ImageUrlFront = Img("mercedes-benz", "s-class", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "LS", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 195,
            Mileage = 5000, LicensePlate = "LUX-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Mark Levinson 3D Audio", "Shiatsu Massage Seats", "Hybrid", "AR HUD"],
            ImageUrl = Img("lexus", "ls"), ImageUrlFront = Img("lexus", "ls", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "LC", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 4, Doors = 4, PricePerDay = 210,
            Mileage = 3000, LicensePlate = "LUX-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Mark Levinson Audio", "Alcantara Interior", "Adaptive Suspension", "Heads-Up Display"],
            ImageUrl = Img("lexus", "lc"), ImageUrlFront = Img("lexus", "lc", angle: "front") },
    ];

    // ── Van ──────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetVanVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Odyssey", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 8, Doors = 4, PricePerDay = 92,
            Mileage = 10000, LicensePlate = "VAN-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Honda Sensing", "Magic Slide Seats", "Rear Entertainment", "CabinWatch"],
            ImageUrl = Img("honda", "odyssey"), ImageUrlFront = Img("honda", "odyssey", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Sienna", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 8, Doors = 4, PricePerDay = 98,
            Mileage = 6000, LicensePlate = "VAN-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Toyota Safety Sense", "Hybrid AWD", "Rear Entertainment", "Power Doors"],
            ImageUrl = Img("toyota", "sienna"), ImageUrlFront = Img("toyota", "sienna", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Carnival", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 8, Doors = 4, PricePerDay = 90,
            Mileage = 7000, LicensePlate = "VAN-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "Kia Drive Wise", "Relaxation Seats", "Rear Entertainment", "Wireless Charging"],
            ImageUrl = Img("kia", "carnival"), ImageUrlFront = Img("kia", "carnival", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "Sprinter", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 12, Doors = 4, PricePerDay = 145,
            Mileage = 8000, LicensePlate = "VAN-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "MBUX", "12-Seat", "Diesel", "Active Brake Assist"],
            ImageUrl = Img("mercedes-benz", "sprinter"), ImageUrlFront = Img("mercedes-benz", "sprinter", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Transit", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 12, Doors = 4, PricePerDay = 130,
            Mileage = 9000, LicensePlate = "VAN-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "SYNC 4", "12-Seat", "Rear Heating", "High Roof"],
            ImageUrl = Img("ford", "transit"), ImageUrlFront = Img("ford", "transit", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Staria", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 9, Doors = 4, PricePerDay = 96,
            Mileage = 5000, LicensePlate = "VAN-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "9-Seat", "Panoramic Roof", "Wireless Charging", "Rear Entertainment"],
            ImageUrl = Img("hyundai", "staria"), ImageUrlFront = Img("hyundai", "staria", angle: "front") },
    ];

    // ── Electric ─────────────────────────────────────────────────────────────
    private static List<Vehicle> GetElectricVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model 3", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 110,
            Mileage = 8000, LicensePlate = "ELC-001", VehicleStatus = VehicleStatus.Available,
            Features = ["Autopilot", "Over-the-Air Updates", "Supercharger Access", "15\" Touchscreen", "360mi Range"],
            ImageUrl = Img("tesla", "model-3"), ImageUrlFront = Img("tesla", "model-3", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model Y", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 125,
            Mileage = 6000, LicensePlate = "ELC-002", VehicleStatus = VehicleStatus.Available,
            Features = ["Autopilot", "AWD", "Supercharger Access", "330mi Range", "Panoramic Roof"],
            ImageUrl = Img("tesla", "model-y"), ImageUrlFront = Img("tesla", "model-y", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model S", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 180,
            Mileage = 5000, LicensePlate = "ELC-003", VehicleStatus = VehicleStatus.Available,
            Features = ["Autopilot", "Tri Motor AWD", "Supercharger Access", "405mi Range", "Yoke Steering"],
            ImageUrl = Img("tesla", "model-s"), ImageUrlFront = Img("tesla", "model-s", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model X", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 7, Doors = 4, PricePerDay = 190,
            Mileage = 4000, LicensePlate = "ELC-004", VehicleStatus = VehicleStatus.Available,
            Features = ["Autopilot", "Falcon Wing Doors", "Supercharger Access", "348mi Range", "7-Seat"],
            ImageUrl = Img("tesla", "model-x"), ImageUrlFront = Img("tesla", "model-x", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Cybertruck", Year = 2024, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 200,
            Mileage = 2000, LicensePlate = "ELC-005", VehicleStatus = VehicleStatus.Available,
            Features = ["Autopilot", "Exoskeleton Body", "Supercharger Access", "340mi Range", "Vault Bed"],
            ImageUrl = Img("tesla", "cybertruck"), ImageUrlFront = Img("tesla", "cybertruck", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Mustang Mach-E", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 105,
            Mileage = 9000, LicensePlate = "ELC-006", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "SYNC 4A", "300mi Range", "AWD", "FordPass App"],
            ImageUrl = Img("ford", "mustang-mach-e"), ImageUrlFront = Img("ford", "mustang-mach-e", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "EV6", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 108,
            Mileage = 4000, LicensePlate = "ELC-007", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "310mi Range", "800V Fast Charging", "AWD", "Augmented Reality HUD"],
            ImageUrl = Img("kia", "ev6"), ImageUrlFront = Img("kia", "ev6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Ariya", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 100,
            Mileage = 6000, LicensePlate = "ELC-008", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "304mi Range", "e-4ORCE AWD", "ProPilot 2.0", "Panoramic Roof"],
            ImageUrl = Img("nissan", "ariya"), ImageUrlFront = Img("nissan", "ariya", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "i4", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 145,
            Mileage = 6000, LicensePlate = "ELC-009", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "301mi Range", "BMW Live Cockpit", "Harman Kardon", "AWD"],
            ImageUrl = Img("bmw", "i4"), ImageUrlFront = Img("bmw", "i4", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "EQS", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 200,
            Mileage = 4000, LicensePlate = "ELC-010", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "350mi Range", "MBUX Hyperscreen", "Burmester 4D Audio", "Rear-Axle Steering"],
            ImageUrl = Img("mercedes-benz", "eqs"), ImageUrlFront = Img("mercedes-benz", "eqs", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "RZ", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 130,
            Mileage = 5000, LicensePlate = "ELC-011", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "220mi Range", "DIRECT4 AWD", "Mark Levinson Audio", "Panoramic Roof"],
            ImageUrl = Img("lexus", "rz"), ImageUrlFront = Img("lexus", "rz", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "IONIQ 6", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 108,
            Mileage = 5000, LicensePlate = "ELC-012", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "361mi Range", "800V Ultra-Fast Charging", "AWD", "Vehicle-to-Load"],
            ImageUrl = Img("hyundai", "ioniq-6"), ImageUrlFront = Img("hyundai", "ioniq-6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R2", Year = 2024, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 115,
            Mileage = 2000, LicensePlate = "ELC-013", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "300mi Range", "Dual Motor AWD", "Compact SUV", "Gear Guard Security"],
            ImageUrl = Img("rivian", "r2"), ImageUrlFront = Img("rivian", "r2", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R3", Year = 2025, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 95,
            Mileage = 1000, LicensePlate = "ELC-014", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "270mi Range", "Dual Motor AWD", "Compact Crossover", "Panoramic Roof"],
            ImageUrl = Img("rivian", "r3"), ImageUrlFront = Img("rivian", "r3", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "MX-30", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 85,
            Mileage = 7000, LicensePlate = "ELC-015", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "100mi Range", "Freestyle Doors", "i-Activsense", "Cork Interior Trim"],
            ImageUrl = Img("mazda", "mx-30"), ImageUrlFront = Img("mazda", "mx-30", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R3X", Year = 2025, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 100,
            Mileage = 1000, LicensePlate = "ELC-016", VehicleStatus = VehicleStatus.Available,
            Features = ["Bluetooth", "260mi Range", "Dual Motor AWD", "Performance Crossover", "Panoramic Roof"],
            ImageUrl = Img("rivian", "r3x"), ImageUrlFront = Img("rivian", "r3x", angle: "front") },
    ];
}
