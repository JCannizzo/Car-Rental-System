import { getAccessToken } from "@/lib/keycloak";

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
  licensePlate?: string;
  status?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export type AdminVehicleSortBy =
  | "vehicle"
  | "category"
  | "plate"
  | "status"
  | "mileage"
  | "rate"
  | "specs";

export type SortDirection = "asc" | "desc";

export interface AdminVehicleQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: VehicleCategory | "all";
  status?: string;
  sortBy?: AdminVehicleSortBy;
  sortDirection?: SortDirection;
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

export interface ClaimBookingResponse {
  bookingId: string;
  confirmationCode: string;
  claimed: boolean;
  redirectTo: string;
}

export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  const payload = await response.text();

  if (!payload) {
    return new ApiError(fallbackMessage, response.status);
  }

  try {
    const parsed = JSON.parse(payload) as { error?: string; title?: string };
    return new ApiError(
      parsed.error || parsed.title || fallbackMessage,
      response.status,
    );
  } catch {
    return new ApiError(payload, response.status);
  }
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  const response = await apiFetch(`/api/Vehicle/${id}`);
  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch vehicle");
  }
  return response.json();
}

export async function createBooking(
  data: CreateBookingRequest,
): Promise<BookingConfirmation> {
  const response = await apiFetch("/api/Bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw await readApiError(response, "Failed to create booking");
  }
  return response.json();
}

export async function fetchBookingByCode(
  code: string,
): Promise<BookingDetails> {
  const response = await apiFetch(`/api/Bookings/confirmation/${code}`);
  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch booking");
  }
  return response.json();
}

export async function claimBooking(
  confirmationCode: string,
): Promise<ClaimBookingResponse> {
  const response = await apiFetch("/api/Bookings/claim", {
    method: "POST",
    body: JSON.stringify({ confirmationCode }),
  });

  if (!response.ok) {
    throw await readApiError(response, "Failed to claim booking");
  }

  return response.json();
}

export async function fetchMyBookings(): Promise<BookingDetails[]> {
  const response = await apiFetch("/api/Bookings/my");

  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch your bookings");
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

  const response = await apiFetch(url);
  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch vehicles");
  }
  return response.json();
}

export async function fetchAdminVehicles(): Promise<Vehicle[]> {
  const response = await apiFetch("/api/Vehicle/admin");

  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch admin vehicles");
  }

  return response.json();
}

export async function fetchAdminVehicleInventory(
  params: AdminVehicleQueryParams = {},
): Promise<PaginatedResult<Vehicle>> {
  const searchParams = new URLSearchParams();

  searchParams.set("Page", String(params.page ?? 1));
  searchParams.set("PageSize", String(params.pageSize ?? 15));
  if (params.search?.trim()) searchParams.set("Search", params.search.trim());
  if (params.category && params.category !== "all") {
    searchParams.set("Category", params.category);
  }
  if (params.status && params.status !== "all") {
    searchParams.set("Status", params.status);
  }
  if (params.sortBy) searchParams.set("SortBy", params.sortBy);
  if (params.sortDirection) {
    searchParams.set("SortDirection", params.sortDirection);
  }

  const response = await apiFetch(
    `/api/Vehicle/admin/inventory?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch inventory vehicles");
  }

  return response.json();
}
