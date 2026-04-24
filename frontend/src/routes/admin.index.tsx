import { Badge } from "@/components/ui/badge";
import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  StatusBadge,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAdminVehicles, type Vehicle } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  Car,
  DollarSign,
  PlusCircle,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { auth, isAdmin, isAllowed } = useAdminAccess("/admin");

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: fetchAdminVehicles,
    queryKey: ["admin-vehicles"],
    retry: false,
  });

  if (!isAllowed || isLoading) {
    return <AdminLoadingState />;
  }

  if (isError) {
    return <AdminErrorState error={error} />;
  }

  return <AdminShell>{renderDashboardContent(data ?? [])}</AdminShell>;
}

function renderDashboardContent(vehicles: Vehicle[]) {
  const summary = getFleetSummary(vehicles);
  const priorityVehicles = getPriorityVehicles(vehicles).slice(0, 6);

  return (
    <section className="grid gap-5 p-4 lg:p-7">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Car}
          label="Total vehicles"
          value={summary.total}
          badge="Fleet"
          badgeClassName="bg-sky-50 text-sky-700"
          note={`${summary.available} available across the fleet`}
        />
        <StatCard
          icon={CalendarClock}
          label="Active rentals"
          value={summary.rented}
          badge="Live"
          badgeClassName="bg-sky-50 text-sky-700"
          note="Vehicles currently marked as rented"
        />
        <StatCard
          icon={Wrench}
          label="Maintenance"
          value={summary.maintenance}
          badge="Service"
          badgeClassName="bg-amber-50 text-amber-700"
          note="Vehicles paused for inspection or repair"
        />
        <StatCard
          icon={DollarSign}
          label="Average rate"
          value={summary.averageRate}
          badge="Pricing"
          badgeClassName="bg-emerald-50 text-emerald-700"
          note="Average daily rate across loaded inventory"
          valuePrefix="$"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <OperationLink
          icon={PlusCircle}
          title="Add vehicle"
          description="Create a new fleet record"
          search={{ addVehicle: true }}
        />
        <OperationLink
          icon={Wrench}
          title="Maintenance queue"
          description={`${summary.maintenance} vehicles need service review`}
          search={{ status: "Maintenance" }}
        />
        <OperationLink
          icon={CalendarClock}
          title="Currently rented"
          description={`${summary.rented} vehicles are out with renters`}
          search={{ status: "Rented" }}
        />
        <OperationLink
          icon={Car}
          title="Ready to rent"
          description={`${summary.available} vehicles are available`}
          search={{ status: "Available" }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Inventory Snapshot</CardTitle>
                <CardDescription>
                  Priority vehicles from the admin inventory
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/inventory">Open inventory</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Plate</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Mileage</th>
                    <th className="px-4 py-3 text-right font-semibold">Rate</th>
                    <th className="px-4 py-3 font-semibold">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {priorityVehicles.length > 0 ? (
                    priorityVehicles.map((vehicle) => {
                      const imageUrl = vehicle.imageUrlFront || vehicle.imageUrl;

                      return (
                        <tr
                          key={vehicle.id}
                          className="border-b transition-colors last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-3">
                            <Link
                              className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                              to="/admin/inventory/$vehicleId"
                              params={{ vehicleId: vehicle.id }}
                            >
                              {imageUrl ? (
                                <img
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  className="h-12 w-16 rounded-md border object-cover"
                                  src={imageUrl}
                                />
                              ) : (
                                <div className="grid h-12 w-16 place-items-center rounded-md border bg-muted">
                                  <Car className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">
                                  {vehicle.make} {vehicle.model}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {vehicle.category} · {vehicle.year}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            {vehicle.licensePlate || "Unassigned"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={vehicle.status} />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {numberFormatter.format(vehicle.mileage)} mi
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {currencyFormatter.format(vehicle.pricePerDay)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getNextAction(vehicle.status)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-muted-foreground"
                        colSpan={6}
                      >
                        No inventory records are loaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Operations Queue</CardTitle>
            <CardDescription>Highest priority items</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <QueueItem
              tone="warning"
              title="Maintenance review"
              description={`${summary.needsAttention} vehicles are out of normal rental rotation.`}
              search={{ status: "Maintenance" }}
            />
            <QueueItem
              tone="info"
              title="Active rental monitoring"
              description={`${summary.rented} vehicles are currently marked as rented.`}
              search={{ status: "Rented" }}
            />
            <QueueItem
              tone="success"
              title="Fleet availability"
              description={`${summary.available} vehicles are available and ready to schedule.`}
              search={{ status: "Available" }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StatCard({
  badge,
  badgeClassName,
  icon: Icon,
  label,
  note,
  valuePrefix = "",
  value,
}: {
  badge: string;
  badgeClassName: string;
  icon: typeof Car;
  label: string;
  note: string;
  value: number;
  valuePrefix?: string;
}) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="font-medium">{label}</CardDescription>
          <Badge className={badgeClassName} variant="secondary">
            {badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold leading-none">
              {valuePrefix}
              {numberFormatter.format(value)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{note}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationLink({
  description,
  icon: Icon,
  search,
  title,
}: {
  description: string;
  icon: typeof Car;
  search?: InventorySearch;
  title: string;
}) {
  return (
    <Link
      className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/60"
      to="/admin/inventory"
      search={search}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
      <span aria-hidden="true" className="text-xl text-muted-foreground">
        ›
      </span>
    </Link>
  );
}

function QueueItem({
  description,
  title,
  tone,
  search,
}: {
  description: string;
  title: string;
  tone: "success" | "warning" | "info";
  search: InventorySearch;
}) {
  const toneClassName =
    tone === "success"
      ? "bg-emerald-600"
      : tone === "warning"
        ? "bg-amber-600"
        : "bg-sky-600";

  return (
    <Link
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b px-4 py-4 transition-colors last:border-0 hover:bg-muted/50"
      to="/admin/inventory"
      search={search}
    >
      <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full", toneClassName)} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("en-US");

type InventorySearch = {
  addVehicle?: boolean;
  status?: string;
};

function getFleetSummary(vehicles: Vehicle[]) {
  let available = 0;
  let rented = 0;
  let maintenance = 0;
  let retired = 0;
  let rateTotal = 0;

  for (const vehicle of vehicles) {
    rateTotal += vehicle.pricePerDay;

    switch (vehicle.status?.toLowerCase()) {
      case "available":
        available += 1;
        break;
      case "rented":
        rented += 1;
        break;
      case "maintenance":
        maintenance += 1;
        break;
      case "retired":
        retired += 1;
        break;
      default:
        break;
    }
  }

  return {
    available,
    averageRate:
      vehicles.length > 0 ? Math.round(rateTotal / vehicles.length) : 0,
    maintenance,
    needsAttention: maintenance + retired,
    rented,
    retired,
    total: vehicles.length,
  };
}

function getPriorityVehicles(vehicles: Vehicle[]) {
  const statusPriority = new Map([
    ["maintenance", 0],
    ["retired", 1],
    ["rented", 2],
    ["available", 3],
  ]);

  return [...vehicles].sort((firstVehicle, secondVehicle) => {
    const firstStatusPriority =
      statusPriority.get(firstVehicle.status?.toLowerCase() ?? "") ?? 4;
    const secondStatusPriority =
      statusPriority.get(secondVehicle.status?.toLowerCase() ?? "") ?? 4;

    if (firstStatusPriority !== secondStatusPriority) {
      return firstStatusPriority - secondStatusPriority;
    }

    return secondVehicle.mileage - firstVehicle.mileage;
  });
}

function getNextAction(status?: string) {
  switch (status?.toLowerCase()) {
    case "rented":
      return "Monitor return schedule";
    case "maintenance":
      return "Complete service inspection";
    case "retired":
      return "Review fleet disposition";
    default:
      return "Ready for booking";
  }
}
