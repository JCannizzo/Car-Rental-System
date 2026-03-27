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

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export const VEHICLE_CATEGORIES = [
  "Economy",
  "Sedan",
  "SUV",
  "Truck",
  "Luxury",
  "Van",
  "Electric",
] as const;

export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

export const TRANSMISSION_TYPES = ["Automatic", "Manual"] as const;
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number];

export const FUEL_TYPES = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Electric",
] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const SEAT_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "2+", value: 2 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
  { label: "7+", value: 7 },
] as const;

export interface VehicleQueryParams {
  cursor?: string;
  pageSize?: number;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  category?: VehicleCategory;
  transmissionType?: TransmissionType;
  fuelType?: FuelType;
  minSeats?: number;
  maxPricePerDay?: number;
}

export interface CreateBookingRequest {
  vehicleId: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationCode: string;
  vehicleId: string;
  vehicleSummary: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  checkoutUrl: string | null;
}

export interface BookingDetails {
  id: string;
  confirmationCode: string;
  vehicleId: string;
  vehicleSummary: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/Vehicle/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch vehicle");
  }
  return response.json();
}

export async function createBooking(
  data: CreateBookingRequest,
): Promise<BookingConfirmation> {
  const response = await fetch("/api/Bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create booking");
  }
  return response.json();
}

export async function fetchBookingByCode(
  code: string,
): Promise<BookingDetails> {
  const response = await fetch(`/api/Bookings/confirmation/${code}`);
  if (!response.ok) {
    throw new Error("Failed to fetch booking");
  }
  return response.json();
}

export async function fetchVehicles(
  params: VehicleQueryParams = {},
): Promise<PaginatedResult<Vehicle>> {
  const searchParams = new URLSearchParams();

  if (params.cursor) searchParams.set("Cursor", params.cursor);
  if (params.pageSize) searchParams.set("PageSize", String(params.pageSize));
  if (params.startDate) searchParams.set("StartDate", params.startDate);
  if (params.endDate) searchParams.set("EndDate", params.endDate);
  if (params.category) searchParams.set("Category", params.category);
  if (params.transmissionType)
    searchParams.set("TransmissionType", params.transmissionType);
  if (params.fuelType) searchParams.set("FuelType", params.fuelType);
  if (params.minSeats) searchParams.set("MinSeats", String(params.minSeats));
  if (params.maxPricePerDay)
    searchParams.set("MaxPricePerDay", String(params.maxPricePerDay));

  const query = searchParams.toString();
  const url = `/api/Vehicle${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  return response.json();
}
