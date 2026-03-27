// src/api/vehicles.ts

import type { Vehicle, VehicleQueryParams } from "../types/vehicle";

const BASE_URL = "/api/vehicle";

function buildQueryString(params: VehicleQueryParams): string {
  const query = new URLSearchParams();

  if (params.startDate)      query.set("startDate", params.startDate);
  if (params.endDate)        query.set("endDate", params.endDate);
  if (params.category)       query.set("category", params.category);
  if (params.transmissionType) query.set("transmissionType", params.transmissionType);
  if (params.fuelType)       query.set("fuelType", params.fuelType);
  if (params.minSeats != null)       query.set("minSeats", String(params.minSeats));
  if (params.maxPricePerDay != null) query.set("maxPricePerDay", String(params.maxPricePerDay));

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// GET /api/vehicle?...filters
export async function getAvailableVehicles(
  params: VehicleQueryParams = {}
): Promise<Vehicle[]> {
  const res = await fetch(`${BASE_URL}${buildQueryString(params)}`);

  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`);

  return res.json() as Promise<Vehicle[]>;
}

// GET /api/vehicle/:id
export async function getVehicleById(id: string): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (res.status === 404) throw new Error(`Vehicle ${id} not found`);
  if (!res.ok) throw new Error(`Failed to fetch vehicle: ${res.status}`);

  return res.json() as Promise<Vehicle>;
}