import type { Vehicle } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { ArrowRight, DoorOpen, Fuel, Settings2, Users } from "lucide-react";

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
      className="group grid gap-4 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:grid-cols-[180px_1fr] sm:p-4 lg:grid-cols-[220px_1fr_auto]"
    >
      <div className="relative overflow-hidden rounded-md bg-card">
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="aspect-[16/10] h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md border border-card/70 bg-card/90 px-2.5 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur">
          {vehicle.category}
        </span>
      </div>

      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-2xl font-black leading-tight tracking-normal text-card-foreground">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-sm font-medium text-muted-foreground">
            {vehicle.year}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
          <span className="flex items-center gap-1.5">
            <Users className="h-5 w-5 text-primary" />
            {vehicle.seats} seats
          </span>
          <span className="flex items-center gap-1.5">
            <DoorOpen className="h-5 w-5 text-primary" />
            {vehicle.doors} doors
          </span>
          <span className="flex items-center gap-1.5">
            <Settings2 className="h-5 w-5 text-primary" />
            {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel className="h-5 w-5 text-primary" />
            {vehicle.fuelType}
          </span>
        </div>

        {vehicle.features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {vehicle.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:col-span-2 lg:col-span-1 lg:min-w-36 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <div className="lg:text-right">
          <p className="text-sm font-medium text-muted-foreground">From</p>
          <p className="text-3xl font-black leading-none text-card-foreground">
            ${vehicle.pricePerDay}
          </p>
          <p className="text-sm text-muted-foreground">per day</p>
        </div>
        <div className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors group-hover:bg-primary/90">
          Select
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

export default VehicleCard;
