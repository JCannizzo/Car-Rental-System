export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  pricePerDay: number;
  mileage: number;
  features: string[];
  imageUrl: string;
  imageUrlFront: string;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch("/api/Vehicle");
  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  return response.json();
}
