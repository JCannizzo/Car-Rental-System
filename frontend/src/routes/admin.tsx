import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, fetchAdminVehicles, type Vehicle } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Car,
  ClipboardList,
  Download,
  Loader2,
  LogOut,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3, isActive: true },
  { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
] as const;

function hasAdminRole(roles: string[] = []) {
  return roles.some((role) => role.toLowerCase() === "admin");
}

function AdminDashboardPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasAdminRole(auth.user?.roles);

  useEffect(() => {
    if (!auth.isReady) {
      return;
    }

    if (!auth.isAuthenticated) {
      void auth.login(`${window.location.origin}/admin`);
      return;
    }

    if (!isAdmin) {
      void navigate({ to: "/" });
    }
  }, [auth, isAdmin, navigate]);

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: fetchAdminVehicles,
    queryKey: ["admin-vehicles"],
    retry: false,
  });

  if (!auth.isReady || !auth.isAuthenticated || !isAdmin) {
    return <AdminLoadingState />;
  }

  if (isLoading) {
    return <AdminLoadingState />;
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : null;
    const message =
      status === 403
        ? "Your account is missing the admin role."
        : status === 401
          ? "Your session expired. Try logging out and back in."
          : error instanceof Error
            ? error.message
            : "Something went wrong.";

    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Unable To Load Admin Dashboard</CardTitle>
              <CardDescription>
                {status !== null ? `(${status}) ` : ""}
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell>{renderDashboardContent(data ?? [])}</AdminShell>;
}

function AdminLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r bg-background lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b px-5 py-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Car Rental</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Admin operations
              </p>
            </div>
          </div>

          <AdminNav className="flex-1 p-4" />

          <div className="border-t p-4">
            <div className="mb-3 rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-semibold">Admin Console</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fleet management
              </p>
            </div>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => void auth.logout(window.location.origin)}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b bg-muted/80 px-4 py-4 backdrop-blur lg:px-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin dashboard
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal">
                  Rental operations
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AdminNav className="flex gap-2 overflow-x-auto lg:hidden" compact />
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download />
                    Export
                  </Button>
                  <Button>
                    <Plus />
                    Add vehicle
                  </Button>
                  <Button
                    className="lg:hidden"
                    variant="outline"
                    onClick={() => void auth.logout(window.location.origin)}
                  >
                    <LogOut />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNav({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Admin">
      {adminNavItems.map((item) => {
        const Icon = item.icon;

        if (item.href === "/admin") {
          return (
            <Link
              key={item.href}
              to="/admin"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                item.isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                compact && "h-9 shrink-0 border bg-background",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        }

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              compact && "h-9 shrink-0 border bg-background",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
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

function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase();
  const className =
    normalized === "available"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "rented"
        ? "bg-sky-50 text-sky-700"
        : normalized === "maintenance"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return (
    <Badge className={className} variant="secondary">
      {status || "Unknown"}
    </Badge>
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
