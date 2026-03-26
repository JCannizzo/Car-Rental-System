import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VehicleCard from "@/components/vehicle-card";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

const cars = [
  {
    id: "1",
    make: "Toyota",
    model: "Yaris",
    year: 2024,
    category: "Economy",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 28,
    mileage: 15000,
    features: ["Bluetooth", "Backup Camera", "USB Charging"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Toyota&modelFamily=Yaris&paintId=colourWhite&angle=side",
  },
  {
    id: "2",
    make: "Honda",
    model: "Accord",
    year: 2024,
    category: "Sedan",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 52,
    mileage: 18000,
    features: ["Leather Seats", "Sunroof", "Apple CarPlay"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Honda&modelFamily=Accord&paintId=colourWhite&angle=side",
  },
  {
    id: "3",
    make: "Toyota",
    model: "RAV4",
    year: 2024,
    category: "SUV",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 72,
    mileage: 20000,
    features: ["AWD", "Lane Assist", "Adaptive Cruise Control"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Toyota&modelFamily=RAV4&paintId=colourWhite&angle=side",
  },
  {
    id: "4",
    make: "Ford",
    model: "F-150",
    year: 2024,
    category: "Truck",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 85,
    mileage: 25000,
    features: ["Towing Package", "Bed Liner", "4WD"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Ford&modelFamily=F-150&paintId=colourWhite&angle=side",
  },
  {
    id: "5",
    make: "BMW",
    model: "5 Series",
    year: 2024,
    category: "Luxury",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 145,
    mileage: 12000,
    features: ["Heated Seats", "Premium Sound", "Navigation"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=BMW&modelFamily=5+Series&paintId=colourWhite&angle=side",
  },
  {
    id: "6",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    category: "Electric",
    transmission: "Automatic",
    fuelType: "Electric",
    seats: 5,
    doors: 4,
    pricePerDay: 80,
    mileage: 10000,
    features: ["Autopilot", "Full Self-Driving", "Glass Roof"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Tesla&modelFamily=Model+3&paintId=colourWhite&angle=side",
  },
  {
    id: "7",
    make: "Chrysler",
    model: "Pacifica",
    year: 2024,
    category: "Van",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 7,
    doors: 4,
    pricePerDay: 88,
    mileage: 22000,
    features: ["Stow 'n Go Seating", "Rear Entertainment", "Power Doors"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Chrysler&modelFamily=Pacifica&paintId=colourWhite&angle=side",
  },
  {
    id: "8",
    make: "Hyundai",
    model: "Accent",
    year: 2024,
    category: "Economy",
    transmission: "Manual",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 30,
    mileage: 14000,
    features: ["Bluetooth", "Cruise Control", "Keyless Entry"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Hyundai&modelFamily=Accent&paintId=colourWhite&angle=side",
  },
  {
    id: "9",
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2024,
    category: "Luxury",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    pricePerDay: 165,
    mileage: 11000,
    features: ["Ambient Lighting", "Burmester Sound", "360 Camera"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Mercedes-Benz&modelFamily=E-Class&paintId=colourWhite&angle=side",
  },
  {
    id: "10",
    make: "Chevrolet",
    model: "Silverado",
    year: 2024,
    category: "Truck",
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 5,
    doors: 4,
    pricePerDay: 95,
    mileage: 28000,
    features: ["Towing Package", "Off-Road Package", "Crew Cab"],
    imageUrl:
      "https://cdn.imagin.studio/getimage?customer=img&make=Chevrolet&modelFamily=Silverado&paintId=colourWhite&angle=side",
  },
];

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  });

  const filteredCars = cars;

  return (
    <>
      <div className="sticky top-[65px] z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Field className="flex w-60">
              <FieldLabel htmlFor="date-picker-range">
                Pick-up & Return Dates
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker-range"
                    className="justify-start px-2.5 font-normal"
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </div>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredCars.length} Available Cars
        </p>
        <div className="flex flex-col divide-y divide-border border border-border rounded-lg overflow-hidden">
          {filteredCars.map((car) => (
            <VehicleCard key={car.id} vehicle={car} />
          ))}
        </div>
      </main>
    </>
  );
}
