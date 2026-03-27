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

export interface VehicleQueryParams {
  cursor?: string;
  pageSize?: number;
}

export async function fetchVehicles(
  params: VehicleQueryParams = {},
): Promise<PaginatedResult<Vehicle>> {
  const searchParams = new URLSearchParams();

  if (params.cursor) searchParams.set("Cursor", params.cursor);
  if (params.pageSize) searchParams.set("PageSize", String(params.pageSize));

  const query = searchParams.toString();
  const url = `/api/Vehicle${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  return response.json();
}
