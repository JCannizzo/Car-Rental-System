import { Badge } from "@/components/ui/badge";
import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
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
import {
  fetchAdminBookings,
  fetchAdminVehicles,
  type AdminBooking,
  type PaginatedResult,
  type Vehicle,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  Car,
  CheckCircle2,
  DollarSign,
  RotateCcw,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { auth, isAdmin, isAllowed } = useAdminAccess("/admin");

  const vehiclesQuery = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: fetchAdminVehicles,
    queryKey: ["admin-vehicles"],
    retry: false,
  });

  const bookingsQuery = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminBookings({
        page: 1,
        pageSize: 6,
        sortBy: "createdAt",
        sortDirection: "desc",
      }),
    queryKey: ["admin-bookings", "dashboard", "recent"],
    retry: false,
  });

  const pendingBookingsQuery = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminBookings({
        page: 1,
        pageSize: 1,
        status: "Pending",
      }),
    queryKey: ["admin-bookings", "dashboard", "pending-count"],
    retry: false,
  });

  const returnsQuery = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminBookings({
        page: 1,
        pageSize: 6,
        paymentStatus: "Paid",
        sortBy: "returnDate",
        sortDirection: "asc",
        status: "Confirmed",
      }),
    queryKey: ["admin-returns", "dashboard"],
    retry: false,
  });

  const completedReturnsQuery = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminBookings({
        page: 1,
        pageSize: 1,
        status: "Completed",
      }),
    queryKey: ["admin-bookings", "dashboard", "completed-count"],
    retry: false,
  });

  if (
    !isAllowed ||
    vehiclesQuery.isLoading ||
    bookingsQuery.isLoading ||
    pendingBookingsQuery.isLoading ||
    returnsQuery.isLoading ||
    completedReturnsQuery.isLoading
  ) {
    return <AdminLoadingState />;
  }

  const failedQuery = [
    vehiclesQuery,
    bookingsQuery,
    pendingBookingsQuery,
    returnsQuery,
    completedReturnsQuery,
  ].find((query) => query.isError);

  if (failedQuery?.isError) {
    return <AdminErrorState error={failedQuery.error} />;
  }

  return (
    <AdminShell>
      {renderDashboardContent({
        bookings: bookingsQuery.data,
        completedReturns: completedReturnsQuery.data,
        pendingBookings: pendingBookingsQuery.data,
        returns: returnsQuery.data,
        vehicles: vehiclesQuery.data ?? [],
      })}
    </AdminShell>
  );
}

function renderDashboardContent({
  bookings,
  completedReturns,
  pendingBookings,
  returns,
  vehicles,
}: {
  bookings?: PaginatedResult<AdminBooking>;
  completedReturns?: PaginatedResult<AdminBooking>;
  pendingBookings?: PaginatedResult<AdminBooking>;
  returns?: PaginatedResult<AdminBooking>;
  vehicles: Vehicle[];
}) {
  const summary = getFleetSummary(vehicles);
  const recentBookings = bookings?.items ?? [];
  const revenue = getVisibleRevenue(recentBookings);

  return (
    <section className="grid gap-5 p-4 lg:p-7">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Total bookings"
          value={bookings?.totalCount ?? 0}
          badge="Bookings"
          badgeClassName="bg-sky-50 text-sky-700"
          note="Reservations loaded from the admin booking queue"
        />
        <StatCard
          icon={XCircle}
          label="Pending review"
          value={pendingBookings?.totalCount ?? 0}
          badge="Action"
          badgeClassName="bg-amber-50 text-amber-700"
          note="Bookings waiting for staff confirmation or cancellation"
        />
        <StatCard
          icon={RotateCcw}
          label="Return queue"
          value={returns?.totalCount ?? 0}
          badge="Returns"
          badgeClassName="bg-violet-50 text-violet-700"
          note="Paid confirmed rentals ready for check-in handling"
        />
        <StatCard
          icon={DollarSign}
          label="Recent revenue"
          value={revenue}
          badge="Paid"
          badgeClassName="bg-emerald-50 text-emerald-700"
          note="Paid booking value in the latest loaded reservations"
          valuePrefix="$"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <OperationLink
          icon={CalendarClock}
          title="All bookings"
          description={`${bookings?.totalCount ?? 0} reservations in the admin queue`}
          to="/admin/bookings"
        />
        <OperationLink
          icon={XCircle}
          title="Pending bookings"
          description={`${pendingBookings?.totalCount ?? 0} bookings need status review`}
          search={{ status: "Pending" }}
          to="/admin/bookings"
        />
        <OperationLink
          icon={RotateCcw}
          title="Returns"
          description={`${returns?.totalCount ?? 0} rentals are ready for check-in`}
          to="/admin/returns"
        />
        <OperationLink
          icon={CheckCircle2}
          title="Completed returns"
          description={`${completedReturns?.totalCount ?? 0} bookings are completed`}
          search={{ status: "Completed" }}
          to="/admin/bookings"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest reservations from the admin booking page
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/bookings">Open bookings</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Booking</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Dates</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">
                            {booking.confirmationCode}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created {formatDate(booking.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{booking.customerName || "Guest customer"}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.customerEmail || "No email on file"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{booking.vehicleSummary}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.licensePlate || "No plate"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(booking.startDate)} -{" "}
                          {formatDate(booking.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <BookingStatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {currencyFormatter.format(booking.totalPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-muted-foreground"
                        colSpan={6}
                      >
                        No booking records are loaded yet.
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
            <CardDescription>Booking and return work in progress</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <QueueItem
              tone="warning"
              title="Pending booking decisions"
              description={`${pendingBookings?.totalCount ?? 0} bookings need confirmation or cancellation.`}
              search={{ status: "Pending" }}
              to="/admin/bookings"
            />
            <QueueItem
              tone="info"
              title="Vehicle return check-ins"
              description={`${returns?.totalCount ?? 0} confirmed paid bookings are in the return queue.`}
              to="/admin/returns"
            />
            <QueueItem
              tone="success"
              title="Fleet availability"
              description={`${summary.available} of ${summary.total} vehicles are available after returns and service updates.`}
              search={{ status: "Available" }}
              to="/admin/inventory"
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
  to,
}: {
  description: string;
  icon: typeof Car;
  search?: AdminDashboardSearch;
  title: string;
  to: AdminDashboardLink;
}) {
  return (
    <Link
      className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/60"
      to={to}
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
  to,
}: {
  description: string;
  title: string;
  tone: "success" | "warning" | "info";
  search?: AdminDashboardSearch;
  to: AdminDashboardLink;
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
      to={to}
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

type BookingSearch = {
  paymentStatus?: string;
  search?: string;
  status?: string;
};

type AdminDashboardSearch = BookingSearch | InventorySearch;

type AdminDashboardLink = "/admin/bookings" | "/admin/returns" | "/admin/inventory";

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

function getVisibleRevenue(bookings: AdminBooking[]) {
  return bookings.reduce(
    (total, booking) =>
      booking.paymentStatus.toLowerCase() === "paid"
        ? total + booking.totalPrice
        : total,
    0,
  );
}

function formatDate(value: string) {
  return format(parseISO(value), "MMM d");
}

function BookingStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className =
    normalized === "confirmed"
      ? "bg-sky-50 text-sky-700"
      : normalized === "completed"
        ? "bg-emerald-50 text-emerald-700"
        : normalized === "pending"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return (
    <Badge className={className} variant="secondary">
      {status}
    </Badge>
  );
}
