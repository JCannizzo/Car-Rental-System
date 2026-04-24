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
import { fetchAdminVehicles, type Vehicle } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  Car,
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
  const totalVehicles = vehicles.length;
  const activeRentals = vehicles.filter((vehicle) =>
    vehicle.status?.toLowerCase() === "rented"
  ).length;
  const vehiclesNeedingAttention = vehicles.filter((vehicle) => {
    const status = vehicle.status?.toLowerCase();
    return status === "maintenance" || status === "retired";
  }).length;
  const attentionVehicles = vehicles
    .filter((vehicle) => vehicle.status?.toLowerCase() !== "available")
    .slice(0, 4);

  return (
    <section className="grid gap-5 p-4 lg:p-7">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Car}
          label="Total vehicles"
          value={totalVehicles}
          badge="Fleet"
          badgeClassName="bg-sky-50 text-sky-700"
          note={`${vehicles.filter((vehicle) => vehicle.status?.toLowerCase() === "available").length} available across the fleet`}
        />
        <StatCard
          icon={CalendarClock}
          label="Active rentals"
          value={activeRentals}
          badge="Live"
          badgeClassName="bg-emerald-50 text-emerald-700"
          note="Vehicles currently marked as rented"
        />
        <StatCard
          icon={AlertTriangle}
          label="Needs attention"
          value={vehiclesNeedingAttention}
          badge="Review"
          badgeClassName="bg-amber-50 text-amber-700"
          note="Maintenance and retired vehicles"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <QuickLink
          href="/admin/inventory"
          title="Inventory"
          description="Update status and vehicle details"
        />
        <QuickLink
          href="/admin/bookings"
          title="Bookings"
          description="Review active and upcoming rentals"
        />
        <QuickLink
          href="/admin/returns"
          title="Returns"
          description="Check vehicles back into the fleet"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Inventory Snapshot</CardTitle>
                <CardDescription>
                  Vehicles requiring operational review
                </CardDescription>
              </div>
              <Badge variant="secondary">{vehiclesNeedingAttention} open</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Plate</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionVehicles.length > 0 ? (
                    attentionVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-11 place-items-center rounded-lg border bg-muted">
                              <Car className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vehicle.category} · {vehicle.year}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {vehicle.licensePlate || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={vehicle.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {getNextAction(vehicle.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-muted-foreground"
                        colSpan={4}
                      >
                        No vehicles need attention right now.
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
              description={`${vehiclesNeedingAttention} vehicles are out of normal rental rotation.`}
            />
            <QueueItem
              tone="info"
              title="Active rental monitoring"
              description={`${activeRentals} vehicles are currently marked as rented.`}
            />
            <QueueItem
              tone="success"
              title="Fleet availability"
              description={`${Math.max(totalVehicles - activeRentals - vehiclesNeedingAttention, 0)} vehicles are available or ready to schedule.`}
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
  value,
}: {
  badge: string;
  badgeClassName: string;
  icon: typeof Car;
  label: string;
  note: string;
  value: number;
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
            <p className="text-4xl font-bold leading-none">{value}</p>
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

function QuickLink({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <a
      className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/60"
      href={href}
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
      <span aria-hidden="true" className="text-xl text-muted-foreground">
        ›
      </span>
    </a>
  );
}

function QueueItem({
  description,
  title,
  tone,
}: {
  description: string;
  title: string;
  tone: "success" | "warning" | "info";
}) {
  const toneClassName =
    tone === "success"
      ? "bg-emerald-600"
      : tone === "warning"
        ? "bg-amber-600"
        : "bg-sky-600";

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b px-4 py-4 last:border-0">
      <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full", toneClassName)} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </article>
  );
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
