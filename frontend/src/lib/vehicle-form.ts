import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_CATEGORIES,
  type Vehicle,
  type VehicleCategory,
  type VehicleUpsertRequest,
} from "@/lib/api";

export const VEHICLE_STATUSES = [
  "Available",
  "Rented",
  "Maintenance",
  "Retired",
] as const;

export interface VehicleFormState {
  make: string;
  model: string;
  year: string;
  category: VehicleCategory;
  transmission: string;
  fuelType: string;
  seats: string;
  doors: string;
  pricePerDay: string;
  mileage: string;
  features: string;
  imageUrl: string;
  imageUrlFront: string;
  licensePlate: string;
  status: string;
}

export const initialVehicleForm: VehicleFormState = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  category: "Sedan",
  transmission: "Automatic",
  fuelType: "Gasoline",
  seats: "5",
  doors: "4",
  pricePerDay: "",
  mileage: "0",
  features: "",
  imageUrl: "",
  imageUrlFront: "",
  licensePlate: "",
  status: "Available",
};

function pickCategory(category: string): VehicleCategory {
  return VEHICLE_CATEGORIES.includes(category as VehicleCategory)
    ? (category as VehicleCategory)
    : "Sedan";
}

function pickOption<T extends readonly string[]>(
  options: T,
  value: string | undefined,
  fallback: T[number],
) {
  return value && options.includes(value) ? value : fallback;
}

export function createVehicleFormState(vehicle: Vehicle): VehicleFormState {
  return {
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    category: pickCategory(vehicle.category),
    transmission: pickOption(TRANSMISSION_TYPES, vehicle.transmission, "Automatic"),
    fuelType: pickOption(FUEL_TYPES, vehicle.fuelType, "Gasoline"),
    seats: String(vehicle.seats),
    doors: String(vehicle.doors),
    pricePerDay: String(vehicle.pricePerDay),
    mileage: String(vehicle.mileage),
    features: vehicle.features.join(", "),
    imageUrl: vehicle.imageUrl,
    imageUrlFront: vehicle.imageUrlFront,
    licensePlate: vehicle.licensePlate ?? "",
    status: pickOption(VEHICLE_STATUSES, vehicle.status, "Available"),
  };
}

export function createVehicleUpsertPayload(
  vehicleForm: VehicleFormState,
): { error: string; payload: null } | { error: null; payload: VehicleUpsertRequest } {
  const make = vehicleForm.make.trim();
  const model = vehicleForm.model.trim();
  const licensePlate = vehicleForm.licensePlate.trim();
  const year = Number(vehicleForm.year);
  const seats = Number(vehicleForm.seats);
  const doors = Number(vehicleForm.doors);
  const pricePerDay = Number(vehicleForm.pricePerDay);
  const mileage = Number(vehicleForm.mileage);

  if (!make || !model || !licensePlate) {
    return { error: "Make, model, and license plate are required.", payload: null };
  }

  if (!Number.isInteger(year) || year < 1900 || year > 3000) {
    return {
      error: "Year must be a whole number between 1900 and 3000.",
      payload: null,
    };
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
    return {
      error: "Seats must be a whole number between 1 and 20.",
      payload: null,
    };
  }

  if (!Number.isInteger(doors) || doors < 1 || doors > 10) {
    return {
      error: "Doors must be a whole number between 1 and 10.",
      payload: null,
    };
  }

  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return { error: "Daily rate must be greater than 0.", payload: null };
  }

  if (!Number.isInteger(mileage) || mileage < 0) {
    return {
      error: "Mileage must be a whole number of 0 or more.",
      payload: null,
    };
  }

  return {
    error: null,
    payload: {
      make,
      model,
      year,
      category: vehicleForm.category,
      transmission: vehicleForm.transmission,
      fuelType: vehicleForm.fuelType,
      seats,
      doors,
      pricePerDay,
      mileage,
      features: vehicleForm.features
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
      imageUrl: vehicleForm.imageUrl.trim(),
      imageUrlFront: vehicleForm.imageUrlFront.trim(),
      licensePlate,
      status: vehicleForm.status,
    },
  };
}
