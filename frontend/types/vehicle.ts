
export type VehicleCategory =
  | "Sedan"
  | "SUV"
  | "Truck"
  | "Van"
  | "Electric"
  | "Luxury"
  | "Convertible"
  | "Coupe";

export interface Vehicle {
  id: string; // Guid → string in TS
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  pricePerDay: number; // decimal → number in TS
  mileage: number;
  features: string[];
  imageUrl: string;
  imageUrlFront: string;
}

export interface VehicleQueryParams {
  startDate?: string;   // DateOnly → "YYYY-MM-DD" string
  endDate?: string;     // DateOnly → "YYYY-MM-DD" string
  category?: VehicleCategory;
  transmissionType?: string;
  fuelType?: string;
  minSeats?: number;
  maxPricePerDay?: number;
}