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
        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Yaris", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 35,
            Mileage = 18000, LicensePlate = "ECO-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Backup Camera", "USB Charging"],
            ImageUrl = Img("toyota", "yaris"), ImageUrlFront = Img("toyota", "yaris", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Fit", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 33,
            Mileage = 22000, LicensePlate = "ECO-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Fuel Efficient", "Compact"],
            ImageUrl = Img("honda", "fit"), ImageUrlFront = Img("honda", "fit", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Versa", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 32,
            Mileage = 12000, LicensePlate = "ECO-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Lane Departure Warning", "USB Charging"],
            ImageUrl = Img("nissan", "versa"), ImageUrlFront = Img("nissan", "versa", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Accent", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Manual", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 30,
            Mileage = 28000, LicensePlate = "ECO-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Air Conditioning"],
            ImageUrl = Img("hyundai", "accent"), ImageUrlFront = Img("hyundai", "accent", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Rio", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 31,
            Mileage = 9000, LicensePlate = "ECO-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Apple CarPlay", "Android Auto"],
            ImageUrl = Img("kia", "rio"), ImageUrlFront = Img("kia", "rio", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Spark", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 4, Doors = 4, PricePerDay = 28,
            Mileage = 31000, LicensePlate = "ECO-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Compact", "Easy Parking"],
            ImageUrl = Img("chevrolet", "spark"), ImageUrlFront = Img("chevrolet", "spark", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mitsubishi", Model = "Mirage", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 29,
            Mileage = 7000, LicensePlate = "ECO-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Fuel Efficient", "USB Charging"],
            ImageUrl = Img("mitsubishi", "mirage"), ImageUrlFront = Img("mitsubishi", "mirage", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Corolla", Year = 2021, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 36,
            Mileage = 41000, LicensePlate = "ECO-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Backup Camera", "Cruise Control"],
            ImageUrl = Img("toyota", "corolla"), ImageUrlFront = Img("toyota", "corolla", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Fiesta", Year = 2021, Category = VehicleCategory.Economy,
            Transmission = "Manual", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 30,
            Mileage = 35000, LicensePlate = "ECO-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC Infotainment"],
            ImageUrl = Img("ford", "fiesta"), ImageUrlFront = Img("ford", "fiesta", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "Polo", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 34,
            Mileage = 19000, LicensePlate = "ECO-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Apple CarPlay", "Rear Sensors"],
            ImageUrl = Img("volkswagen", "polo"), ImageUrlFront = Img("volkswagen", "polo", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Renault", Model = "Clio", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 32,
            Mileage = 6000, LicensePlate = "ECO-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Lane Assist", "USB Charging"],
            ImageUrl = Img("renault", "clio"), ImageUrlFront = Img("renault", "clio", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "Mazda2", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 33,
            Mileage = 15000, LicensePlate = "ECO-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Blind Spot Monitoring", "Backup Camera"],
            ImageUrl = Img("mazda", "mazda2"), ImageUrlFront = Img("mazda", "mazda2", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Civic", Year = 2021, Category = VehicleCategory.Economy,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 37,
            Mileage = 44000, LicensePlate = "ECO-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "Apple CarPlay"],
            ImageUrl = Img("honda", "civic"), ImageUrlFront = Img("honda", "civic", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Suzuki", Model = "Swift", Year = 2023, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 29,
            Mileage = 4000, LicensePlate = "ECO-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Compact", "Fuel Efficient"],
            ImageUrl = Img("suzuki", "swift"), ImageUrlFront = Img("suzuki", "swift", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Forte", Year = 2022, Category = VehicleCategory.Economy,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 34,
            Mileage = 23000, LicensePlate = "ECO-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Android Auto", "Backup Camera"],
            ImageUrl = Img("kia", "forte"), ImageUrlFront = Img("kia", "forte", angle: "front") },
    ];

    // ── Sedan ────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetSedanVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Camry", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 55,
            Mileage = 8000, LicensePlate = "SED-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Apple CarPlay", "Backup Camera", "Adaptive Cruise Control"],
            ImageUrl = Img("toyota", "camry"), ImageUrlFront = Img("toyota", "camry", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Accord", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 57,
            Mileage = 6000, LicensePlate = "SED-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "Wireless CarPlay", "Heated Seats"],
            ImageUrl = Img("honda", "accord"), ImageUrlFront = Img("honda", "accord", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Altima", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 52,
            Mileage = 17000, LicensePlate = "SED-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "ProPilot Assist", "Android Auto"],
            ImageUrl = Img("nissan", "altima"), ImageUrlFront = Img("nissan", "altima", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Sonata", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 53,
            Mileage = 21000, LicensePlate = "SED-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Lane Keeping Assist", "Smart Cruise Control", "Sunroof"],
            ImageUrl = Img("hyundai", "sonata"), ImageUrlFront = Img("hyundai", "sonata", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "Mazda6", Year = 2021, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 54,
            Mileage = 29000, LicensePlate = "SED-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Bose Audio", "Heated Seats", "Blind Spot Monitoring"],
            ImageUrl = Img("mazda", "mazda6"), ImageUrlFront = Img("mazda", "mazda6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "Passat", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 56,
            Mileage = 14000, LicensePlate = "SED-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Digital Cockpit", "Adaptive Cruise Control"],
            ImageUrl = Img("volkswagen", "passat"), ImageUrlFront = Img("volkswagen", "passat", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Fusion", Year = 2021, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 58,
            Mileage = 33000, LicensePlate = "SED-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 3", "Hybrid Engine", "Backup Camera"],
            ImageUrl = Img("ford", "fusion"), ImageUrlFront = Img("ford", "fusion", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Malibu", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 51,
            Mileage = 19000, LicensePlate = "SED-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Apple CarPlay", "Teen Driver Mode"],
            ImageUrl = Img("chevrolet", "malibu"), ImageUrlFront = Img("chevrolet", "malibu", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "K5", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 55,
            Mileage = 5000, LicensePlate = "SED-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Kia Drive Wise", "Panoramic Sunroof", "Wireless Charging"],
            ImageUrl = Img("kia", "k5"), ImageUrlFront = Img("kia", "k5", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Subaru", Model = "Legacy", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 54,
            Mileage = 16000, LicensePlate = "SED-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "EyeSight Driver Assist", "AWD", "Heated Seats"],
            ImageUrl = Img("subaru", "legacy"), ImageUrlFront = Img("subaru", "legacy", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Avalon", Year = 2021, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 62,
            Mileage = 27000, LicensePlate = "SED-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "JBL Audio", "Hybrid", "Heated & Ventilated Seats"],
            ImageUrl = Img("toyota", "avalon"), ImageUrlFront = Img("toyota", "avalon", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Insight", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "CVT", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 56,
            Mileage = 13000, LicensePlate = "SED-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "Hybrid Engine", "Apple CarPlay"],
            ImageUrl = Img("honda", "insight"), ImageUrlFront = Img("honda", "insight", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Elantra", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 48,
            Mileage = 4000, LicensePlate = "SED-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Safe Exit Assist", "Android Auto", "Wireless Charging"],
            ImageUrl = Img("hyundai", "elantra"), ImageUrlFront = Img("hyundai", "elantra", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Maxima", Year = 2022, Category = VehicleCategory.Sedan,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 60,
            Mileage = 22000, LicensePlate = "SED-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Bose Audio", "Sport Tuned Suspension", "Heated Seats"],
            ImageUrl = Img("nissan", "maxima"), ImageUrlFront = Img("nissan", "maxima", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "Jetta", Year = 2023, Category = VehicleCategory.Sedan,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 50,
            Mileage = 7000, LicensePlate = "SED-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "IQ.DRIVE", "Digital Cockpit", "Apple CarPlay"],
            ImageUrl = Img("volkswagen", "jetta"), ImageUrlFront = Img("volkswagen", "jetta", angle: "front") },
    ];

    // ── SUV ──────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetSuvVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "RAV4", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 75,
            Mileage = 9000, LicensePlate = "SUV-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "AWD", "Hybrid", "Toyota Safety Sense", "Backup Camera"],
            ImageUrl = Img("toyota", "rav4"), ImageUrlFront = Img("toyota", "rav4", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "CR-V", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "CVT", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 73,
            Mileage = 7000, LicensePlate = "SUV-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "Panoramic Roof", "Wireless CarPlay"],
            ImageUrl = Img("honda", "cr-v"), ImageUrlFront = Img("honda", "cr-v", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Escape", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 68,
            Mileage = 18000, LicensePlate = "SUV-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4", "Blind Spot Info System", "Backup Camera"],
            ImageUrl = Img("ford", "escape"), ImageUrlFront = Img("ford", "escape", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Equinox", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 67,
            Mileage = 11000, LicensePlate = "SUV-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Chevy Safety Assist", "Heated Seats", "Remote Start"],
            ImageUrl = Img("chevrolet", "equinox"), ImageUrlFront = Img("chevrolet", "equinox", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Tucson", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 72,
            Mileage = 6000, LicensePlate = "SUV-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Hyundai SmartSense", "Panoramic Sunroof", "Wireless Charging"],
            ImageUrl = Img("hyundai", "tucson"), ImageUrlFront = Img("hyundai", "tucson", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Sportage", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 71,
            Mileage = 5000, LicensePlate = "SUV-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Kia Drive Wise", "Panoramic Display", "Heated Seats"],
            ImageUrl = Img("kia", "sportage"), ImageUrlFront = Img("kia", "sportage", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mazda", Model = "CX-5", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 70,
            Mileage = 16000, LicensePlate = "SUV-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "i-Activsense", "Bose Audio", "AWD"],
            ImageUrl = Img("mazda", "cx-5"), ImageUrlFront = Img("mazda", "cx-5", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Rogue", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 69,
            Mileage = 8000, LicensePlate = "SUV-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "ProPilot Assist", "3-Zone Climate", "Panoramic Moonroof"],
            ImageUrl = Img("nissan", "rogue"), ImageUrlFront = Img("nissan", "rogue", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Subaru", Model = "Forester", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "CVT", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 68,
            Mileage = 20000, LicensePlate = "SUV-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "EyeSight", "Symmetrical AWD", "Panoramic Moonroof"],
            ImageUrl = Img("subaru", "forester"), ImageUrlFront = Img("subaru", "forester", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Highlander", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 8, Doors = 4, PricePerDay = 90,
            Mileage = 24000, LicensePlate = "SUV-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Toyota Safety Sense", "8-Seat", "Hybrid", "Panoramic Roof"],
            ImageUrl = Img("toyota", "highlander"), ImageUrlFront = Img("toyota", "highlander", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Explorer", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 7, Doors = 4, PricePerDay = 88,
            Mileage = 10000, LicensePlate = "SUV-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4A", "7-Seat", "Trailer Tow Package", "Backup Camera"],
            ImageUrl = Img("ford", "explorer"), ImageUrlFront = Img("ford", "explorer", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Jeep", Model = "Grand Cherokee", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 85,
            Mileage = 19000, LicensePlate = "SUV-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "4WD", "Uconnect 5", "Heated Seats", "Tow Hitch"],
            ImageUrl = Img("jeep", "grand-cherokee"), ImageUrlFront = Img("jeep", "grand-cherokee", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "Tiguan", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 7, Doors = 4, PricePerDay = 78,
            Mileage = 7000, LicensePlate = "SUV-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "IQ.DRIVE", "7-Seat", "Digital Cockpit", "Panoramic Roof"],
            ImageUrl = Img("volkswagen", "tiguan"), ImageUrlFront = Img("volkswagen", "tiguan", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "GMC", Model = "Terrain", Year = 2022, Category = VehicleCategory.SUV,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 70,
            Mileage = 22000, LicensePlate = "SUV-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "GMC ProSafety", "Heated Seats", "Remote Start"],
            ImageUrl = Img("gmc", "terrain"), ImageUrlFront = Img("gmc", "terrain", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mitsubishi", Model = "Outlander", Year = 2023, Category = VehicleCategory.SUV,
            Transmission = "CVT", FuelType = "Petrol", Seats = 7, Doors = 4, PricePerDay = 72,
            Mileage = 5000, LicensePlate = "SUV-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MI-PILOT", "7-Seat", "Wireless Charging", "Heated Seats"],
            ImageUrl = Img("mitsubishi", "outlander"), ImageUrlFront = Img("mitsubishi", "outlander", angle: "front") },
    ];

    // ── Truck ────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetTruckVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "F-150", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 95,
            Mileage = 8000, LicensePlate = "TRK-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4", "Tow Package", "Bed Liner", "4WD"],
            ImageUrl = Img("ford", "f-150"), ImageUrlFront = Img("ford", "f-150", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Silverado", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 93,
            Mileage = 10000, LicensePlate = "TRK-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Chevy Safety Assist", "Tow Package", "4WD", "Backup Camera"],
            ImageUrl = Img("chevrolet", "silverado"), ImageUrlFront = Img("chevrolet", "silverado", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "RAM", Model = "1500", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 97,
            Mileage = 6000, LicensePlate = "TRK-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Uconnect 5", "Air Suspension", "Tow Package", "4WD"],
            ImageUrl = Img("ram", "1500"), ImageUrlFront = Img("ram", "1500", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Tacoma", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 88,
            Mileage = 15000, LicensePlate = "TRK-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Toyota Safety Sense", "4WD", "Off-Road Package"],
            ImageUrl = Img("toyota", "tacoma"), ImageUrlFront = Img("toyota", "tacoma", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "GMC", Model = "Sierra", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 92,
            Mileage = 18000, LicensePlate = "TRK-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MultiPro Tailgate", "4WD", "Bose Audio", "Tow Package"],
            ImageUrl = Img("gmc", "sierra"), ImageUrlFront = Img("gmc", "sierra", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Frontier", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 82,
            Mileage = 7000, LicensePlate = "TRK-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "4WD", "Bed Liner", "Tow Package", "Apple CarPlay"],
            ImageUrl = Img("nissan", "frontier"), ImageUrlFront = Img("nissan", "frontier", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Ridgeline", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 85,
            Mileage = 20000, LicensePlate = "TRK-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "In-Bed Trunk", "AWD", "Apple CarPlay"],
            ImageUrl = Img("honda", "ridgeline"), ImageUrlFront = Img("honda", "ridgeline", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Ranger", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 80,
            Mileage = 9000, LicensePlate = "TRK-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4", "4WD", "FX4 Off-Road Package"],
            ImageUrl = Img("ford", "ranger"), ImageUrlFront = Img("ford", "ranger", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Tundra", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 100,
            Mileage = 12000, LicensePlate = "TRK-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Toyota Safety Sense", "Hybrid V6", "4WD", "Tow Package"],
            ImageUrl = Img("toyota", "tundra"), ImageUrlFront = Img("toyota", "tundra", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Colorado", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 78,
            Mileage = 5000, LicensePlate = "TRK-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "4WD", "Chevy Safety Assist", "Apple CarPlay"],
            ImageUrl = Img("chevrolet", "colorado"), ImageUrlFront = Img("chevrolet", "colorado", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "RAM", Model = "2500", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 5, Doors = 4, PricePerDay = 110,
            Mileage = 25000, LicensePlate = "TRK-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Uconnect 5", "Heavy Duty Tow", "4WD", "Diesel Engine"],
            ImageUrl = Img("ram", "2500"), ImageUrlFront = Img("ram", "2500", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "F-250", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 5, Doors = 4, PricePerDay = 112,
            Mileage = 28000, LicensePlate = "TRK-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4", "Power Stroke Diesel", "4WD", "Heavy Duty Tow"],
            ImageUrl = Img("ford", "f-250"), ImageUrlFront = Img("ford", "f-250", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "GMC", Model = "Canyon", Year = 2023, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 79,
            Mileage = 4000, LicensePlate = "TRK-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "4WD", "AT4 Off-Road", "Apple CarPlay", "Bose Audio"],
            ImageUrl = Img("gmc", "canyon"), ImageUrlFront = Img("gmc", "canyon", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Jeep", Model = "Gladiator", Year = 2022, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 90,
            Mileage = 17000, LicensePlate = "TRK-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "4WD", "Rock-Trac", "Removable Doors", "Uconnect 5"],
            ImageUrl = Img("jeep", "gladiator"), ImageUrlFront = Img("jeep", "gladiator", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Subaru", Model = "Baja", Year = 2021, Category = VehicleCategory.Truck,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 4, Doors = 4, PricePerDay = 75,
            Mileage = 38000, LicensePlate = "TRK-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "AWD", "Compact Bed", "Unique Style"],
            ImageUrl = Img("subaru", "baja"), ImageUrlFront = Img("subaru", "baja", angle: "front") },
    ];

    // ── Luxury ───────────────────────────────────────────────────────────────
    private static List<Vehicle> GetLuxuryVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "5 Series", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 150,
            Mileage = 5000, LicensePlate = "LUX-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "BMW Live Cockpit", "Heated Seats", "Harman Kardon Audio", "Heads-Up Display"],
            ImageUrl = Img("bmw", "5-series"), ImageUrlFront = Img("bmw", "5-series", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "E-Class", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 160,
            Mileage = 4000, LicensePlate = "LUX-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MBUX", "Burmester Audio", "Heated & Ventilated Seats", "Panoramic Roof"],
            ImageUrl = Img("mercedes-benz", "e-class"), ImageUrlFront = Img("mercedes-benz", "e-class", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Audi", Model = "A6", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 155,
            Mileage = 6000, LicensePlate = "LUX-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MMI Navigation", "Bang & Olufsen Audio", "Quattro AWD", "Matrix LED"],
            ImageUrl = Img("audi", "a6"), ImageUrlFront = Img("audi", "a6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "ES", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 145,
            Mileage = 7000, LicensePlate = "LUX-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Lexus Safety System+", "Mark Levinson Audio", "Hybrid", "Panoramic Roof"],
            ImageUrl = Img("lexus", "es"), ImageUrlFront = Img("lexus", "es", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Cadillac", Model = "CT5", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 140,
            Mileage = 12000, LicensePlate = "LUX-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Super Cruise", "Bose Audio", "Heated Seats", "Night Vision"],
            ImageUrl = Img("cadillac", "ct5"), ImageUrlFront = Img("cadillac", "ct5", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "7 Series", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 200,
            Mileage = 9000, LicensePlate = "LUX-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Executive Lounge", "Bowers & Wilkins Audio", "Massage Seats", "Sky Lounge Roof"],
            ImageUrl = Img("bmw", "7-series"), ImageUrlFront = Img("bmw", "7-series", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "S-Class", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 220,
            Mileage = 3000, LicensePlate = "LUX-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MBUX Hyperscreen", "4D Burmester Audio", "Rear Executive Seats", "AR Navigation"],
            ImageUrl = Img("mercedes-benz", "s-class"), ImageUrlFront = Img("mercedes-benz", "s-class", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Audi", Model = "A8", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 210,
            Mileage = 8000, LicensePlate = "LUX-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Predictive Active Suspension", "Bang & Olufsen 3D", "Massage Seats", "Night Vision"],
            ImageUrl = Img("audi", "a8"), ImageUrlFront = Img("audi", "a8", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Porsche", Model = "Panamera", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 4, Doors = 4, PricePerDay = 230,
            Mileage = 11000, LicensePlate = "LUX-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Porsche Connect", "BOSE Surround", "Sport Chrono", "Hybrid"],
            ImageUrl = Img("porsche", "panamera"), ImageUrlFront = Img("porsche", "panamera", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Genesis", Model = "G80", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 138,
            Mileage = 4000, LicensePlate = "LUX-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Genesis Connected Services", "Lexicon Audio", "Massage Seats", "Panoramic Roof"],
            ImageUrl = Img("genesis", "g80"), ImageUrlFront = Img("genesis", "g80", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volvo", Model = "S90", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 148,
            Mileage = 13000, LicensePlate = "LUX-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Pilot Assist", "Bowers & Wilkins Audio", "Heated Seats", "Panoramic Roof"],
            ImageUrl = Img("volvo", "s90"), ImageUrlFront = Img("volvo", "s90", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Jaguar", Model = "XF", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 145,
            Mileage = 16000, LicensePlate = "LUX-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Pivi Pro", "Meridian Audio", "Heated Seats", "Heads-Up Display"],
            ImageUrl = Img("jaguar", "xf"), ImageUrlFront = Img("jaguar", "xf", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lincoln", Model = "Continental", Year = 2021, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 135,
            Mileage = 22000, LicensePlate = "LUX-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Lincoln Co-Pilot360", "Revel Audio", "30-Way Adjustable Seats", "Panoramic Roof"],
            ImageUrl = Img("lincoln", "continental"), ImageUrlFront = Img("lincoln", "continental", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Maserati", Model = "Ghibli", Year = 2022, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 250,
            Mileage = 10000, LicensePlate = "LUX-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Harman Kardon Audio", "Sport Package", "Carbon Fiber Trim", "Heated Seats"],
            ImageUrl = Img("maserati", "ghibli"), ImageUrlFront = Img("maserati", "ghibli", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lexus", Model = "LS", Year = 2023, Category = VehicleCategory.Luxury,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 5, Doors = 4, PricePerDay = 195,
            Mileage = 5000, LicensePlate = "LUX-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Mark Levinson 3D Audio", "Shiatsu Massage Seats", "Hybrid", "AR HUD"],
            ImageUrl = Img("lexus", "ls"), ImageUrlFront = Img("lexus", "ls", angle: "front") },
    ];

    // ── Van ──────────────────────────────────────────────────────────────────
    private static List<Vehicle> GetVanVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Chrysler", Model = "Pacifica", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Hybrid", Seats = 7, Doors = 4, PricePerDay = 95,
            Mileage = 8000, LicensePlate = "VAN-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Stow 'n Go Seats", "Hybrid", "Uconnect 5", "Rear Entertainment"],
            ImageUrl = Img("chrysler", "pacifica"), ImageUrlFront = Img("chrysler", "pacifica", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "Sienna", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "CVT", FuelType = "Hybrid", Seats = 8, Doors = 4, PricePerDay = 98,
            Mileage = 6000, LicensePlate = "VAN-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Toyota Safety Sense", "Hybrid AWD", "Rear Entertainment", "Power Doors"],
            ImageUrl = Img("toyota", "sienna"), ImageUrlFront = Img("toyota", "sienna", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Honda", Model = "Odyssey", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 8, Doors = 4, PricePerDay = 92,
            Mileage = 15000, LicensePlate = "VAN-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Honda Sensing", "Magic Slide Seats", "Rear Entertainment", "CabinWatch"],
            ImageUrl = Img("honda", "odyssey"), ImageUrlFront = Img("honda", "odyssey", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "Carnival", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 8, Doors = 4, PricePerDay = 90,
            Mileage = 7000, LicensePlate = "VAN-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Kia Drive Wise", "Relaxation Seats", "Rear Entertainment", "Wireless Charging"],
            ImageUrl = Img("kia", "carnival"), ImageUrlFront = Img("kia", "carnival", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Transit Connect", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 80,
            Mileage = 20000, LicensePlate = "VAN-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 3", "Cargo Van Option", "Easy Load Floor"],
            ImageUrl = Img("ford", "transit-connect"), ImageUrlFront = Img("ford", "transit-connect", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "Metris", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 7, Doors = 4, PricePerDay = 105,
            Mileage = 18000, LicensePlate = "VAN-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MBUX", "Heated Seats", "360 Camera", "Cargo Configuration"],
            ImageUrl = Img("mercedes-benz", "metris"), ImageUrlFront = Img("mercedes-benz", "metris", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Dodge", Model = "Grand Caravan", Year = 2021, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 7, Doors = 4, PricePerDay = 82,
            Mileage = 35000, LicensePlate = "VAN-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Stow 'n Go Seats", "Backup Camera", "Rear Climate Control"],
            ImageUrl = Img("dodge", "grand-caravan"), ImageUrlFront = Img("dodge", "grand-caravan", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "Transporter", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 9, Doors = 4, PricePerDay = 110,
            Mileage = 22000, LicensePlate = "VAN-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "9-Seat", "Diesel", "Navigation", "Rear A/C"],
            ImageUrl = Img("volkswagen", "transporter"), ImageUrlFront = Img("volkswagen", "transporter", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Transit", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 12, Doors = 4, PricePerDay = 130,
            Mileage = 9000, LicensePlate = "VAN-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4", "12-Seat", "Rear Heating", "High Roof"],
            ImageUrl = Img("ford", "transit"), ImageUrlFront = Img("ford", "transit", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Express", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 12, Doors = 4, PricePerDay = 125,
            Mileage = 28000, LicensePlate = "VAN-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "12-Seat", "Rear A/C", "Tow Package"],
            ImageUrl = Img("chevrolet", "express"), ImageUrlFront = Img("chevrolet", "express", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ram", Model = "ProMaster", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 5, Doors = 4, PricePerDay = 88,
            Mileage = 11000, LicensePlate = "VAN-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "Uconnect 5", "High Roof", "Cargo Configuration"],
            ImageUrl = Img("ram", "promaster"), ImageUrlFront = Img("ram", "promaster", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "NV Passenger", Year = 2021, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 12, Doors = 4, PricePerDay = 118,
            Mileage = 33000, LicensePlate = "VAN-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "12-Seat", "Rear A/C", "Backup Camera"],
            ImageUrl = Img("nissan", "nv-passenger"), ImageUrlFront = Img("nissan", "nv-passenger", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Toyota", Model = "HiAce", Year = 2022, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 14, Doors = 4, PricePerDay = 140,
            Mileage = 19000, LicensePlate = "VAN-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "14-Seat", "Diesel", "Rear A/C", "Commercial Grade"],
            ImageUrl = Img("toyota", "hiace"), ImageUrlFront = Img("toyota", "hiace", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "Sprinter", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Diesel", Seats = 12, Doors = 4, PricePerDay = 145,
            Mileage = 8000, LicensePlate = "VAN-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "MBUX", "12-Seat", "Diesel", "Active Brake Assist"],
            ImageUrl = Img("mercedes-benz", "sprinter"), ImageUrlFront = Img("mercedes-benz", "sprinter", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "Staria", Year = 2023, Category = VehicleCategory.Van,
            Transmission = "Automatic", FuelType = "Petrol", Seats = 9, Doors = 4, PricePerDay = 96,
            Mileage = 5000, LicensePlate = "VAN-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "9-Seat", "Panoramic Roof", "Wireless Charging", "Rear Entertainment"],
            ImageUrl = Img("hyundai", "staria"), ImageUrlFront = Img("hyundai", "staria", angle: "front") },
    ];

    // ── Electric ─────────────────────────────────────────────────────────────
    private static List<Vehicle> GetElectricVehicles() =>
    [
        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model 3", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 110,
            Mileage = 8000, LicensePlate = "ELC-001", VehicleStatus = VehicleStatus.Active,
            Features = ["Autopilot", "Over-the-Air Updates", "Supercharger Access", "15\" Touchscreen", "360 Range"],
            ImageUrl = Img("tesla", "model-3"), ImageUrlFront = Img("tesla", "model-3", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Tesla", Model = "Model Y", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 125,
            Mileage = 6000, LicensePlate = "ELC-002", VehicleStatus = VehicleStatus.Active,
            Features = ["Autopilot", "AWD", "Supercharger Access", "330mi Range", "Panoramic Roof"],
            ImageUrl = Img("tesla", "model-y"), ImageUrlFront = Img("tesla", "model-y", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Ford", Model = "Mustang Mach-E", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 105,
            Mileage = 9000, LicensePlate = "ELC-003", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "SYNC 4A", "300mi Range", "AWD", "FordPass App"],
            ImageUrl = Img("ford", "mustang-mach-e"), ImageUrlFront = Img("ford", "mustang-mach-e", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Chevrolet", Model = "Bolt EV", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 88,
            Mileage = 7000, LicensePlate = "ELC-004", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "259mi Range", "DC Fast Charging", "One-Pedal Driving"],
            ImageUrl = Img("chevrolet", "bolt-ev"), ImageUrlFront = Img("chevrolet", "bolt-ev", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Hyundai", Model = "IONIQ 6", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 108,
            Mileage = 5000, LicensePlate = "ELC-005", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "361mi Range", "800V Ultra-Fast Charging", "AWD", "Vehicle-to-Load"],
            ImageUrl = Img("hyundai", "ioniq-6"), ImageUrlFront = Img("hyundai", "ioniq-6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Kia", Model = "EV6", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 108,
            Mileage = 4000, LicensePlate = "ELC-006", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "310mi Range", "800V Fast Charging", "AWD", "Augmented Reality HUD"],
            ImageUrl = Img("kia", "ev6"), ImageUrlFront = Img("kia", "ev6", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Volkswagen", Model = "ID.4", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 98,
            Mileage = 10000, LicensePlate = "ELC-007", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "275mi Range", "AWD", "ID. Light", "Augmented Reality Navigation"],
            ImageUrl = Img("volkswagen", "id.4"), ImageUrlFront = Img("volkswagen", "id.4", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Nissan", Model = "Leaf", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 80,
            Mileage = 12000, LicensePlate = "ELC-008", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "212mi Range", "ProPilot Assist", "e-Pedal", "Apple CarPlay"],
            ImageUrl = Img("nissan", "leaf"), ImageUrlFront = Img("nissan", "leaf", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "BMW", Model = "i4", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 145,
            Mileage = 6000, LicensePlate = "ELC-009", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "301mi Range", "BMW Live Cockpit", "Harman Kardon", "AWD"],
            ImageUrl = Img("bmw", "i4"), ImageUrlFront = Img("bmw", "i4", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Mercedes-Benz", Model = "EQS", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 200,
            Mileage = 4000, LicensePlate = "ELC-010", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "350mi Range", "MBUX Hyperscreen", "Burmester 4D Audio", "Rear-Axle Steering"],
            ImageUrl = Img("mercedes-benz", "eqs"), ImageUrlFront = Img("mercedes-benz", "eqs", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Rivian", Model = "R1T", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 175,
            Mileage = 3000, LicensePlate = "ELC-011", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "314mi Range", "Quad Motor AWD", "Camp Kitchen", "Gear Tunnel"],
            ImageUrl = Img("rivian", "r1t"), ImageUrlFront = Img("rivian", "r1t", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Lucid", Model = "Air", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 220,
            Mileage = 2000, LicensePlate = "ELC-012", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "516mi Range", "Dream Drive Pro", "Surreal Sound", "Glass Canopy Roof"],
            ImageUrl = Img("lucid", "air"), ImageUrlFront = Img("lucid", "air", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Polestar", Model = "2", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 112,
            Mileage = 7000, LicensePlate = "ELC-013", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "270mi Range", "AWD", "Google Built-In", "Harman Kardon"],
            ImageUrl = Img("polestar", "2"), ImageUrlFront = Img("polestar", "2", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Audi", Model = "Q4 e-tron", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 118,
            Mileage = 8000, LicensePlate = "ELC-014", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "265mi Range", "Quattro AWD", "AR Head-Up Display", "MMI Navigation"],
            ImageUrl = Img("audi", "q4-e-tron"), ImageUrlFront = Img("audi", "q4-e-tron", angle: "front") },

        new() { Id = Guid.NewGuid(), Make = "Genesis", Model = "GV60", Year = 2023, Category = VehicleCategory.Electric,
            Transmission = "Automatic", FuelType = "Electric", Seats = 5, Doors = 4, PricePerDay = 115,
            Mileage = 5000, LicensePlate = "ELC-015", VehicleStatus = VehicleStatus.Active,
            Features = ["Bluetooth", "248mi Range", "800V Fast Charging", "Face Connect", "Boost Mode AWD"],
            ImageUrl = Img("genesis", "gv60"), ImageUrlFront = Img("genesis", "gv60", angle: "front") },
    ];
}