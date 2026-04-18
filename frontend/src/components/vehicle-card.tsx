import type { Vehicle } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { Fuel, Settings2, Users, Luggage } from "lucide-react";

function VehicleCard({
  vehicle,
  startDate,
  endDate,
}: {
  vehicle: Vehicle;
  startDate?: string;
  endDate?: string;
}) {
  return (
    <Link
      to="/vehicles/$vehicleId"
      params={{ vehicleId: vehicle.id }}
      search={{ startDate, endDate }}
      className="flex items-center gap-4 p-4 bg-card hover:bg-muted/50 transition-colors"
    >
      <img
        src={vehicle.imageUrl}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="w-24 h-16 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {vehicle.category}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {vehicle.seats} seats
          </span>
          <span className="flex items-center gap-1">
            <Luggage className="h-3.5 w-3.5" />
            {vehicle.doors} bags
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {vehicle.fuelType}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <span className="font-semibold">${vehicle.pricePerDay}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <div className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md">
          Select
        </div>
      </div>
    </Link>
  );
}

export default VehicleCard;