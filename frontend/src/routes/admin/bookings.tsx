import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiError,
  fetchAdminBookings,
  updateAdminBookingStatus,
  type AdminBooking,
  type AdminBookingSortBy,
  type SortDirection,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  ArrowUpDown,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 350;
const BOOKING_STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"];
const PAYMENT_STATUSES = ["Unpaid", "Paid", "Refunded"];

interface AdminBookingsSearchParams {
  page?: number;
  paymentStatus?: string;
  search?: string;
  sortBy?: AdminBookingSortBy;
  sortDirection?: SortDirection;
  status?: string;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

function parsePageSearch(value: unknown) {
  const page = typeof value === "string" ? Number(value) : value;

  return typeof page === "number" && Number.isInteger(page) && page > 0
    ? page
    : undefined;
}

function parseSortBySearch(value: unknown) {
  const sortOptions: AdminBookingSortBy[] = [
    "createdAt",
    "date",
    "returnDate",
    "customer",
    "vehicle",
    "status",
    "payment",
    "total",
  ];

  return typeof value === "string" &&
    sortOptions.includes(value as AdminBookingSortBy)
    ? (value as AdminBookingSortBy)
    : undefined;
}

function parseSortDirectionSearch(value: unknown) {
  return value === "asc" || value === "desc" ? value : undefined;
}

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): AdminBookingsSearchParams => ({
    page: parsePageSearch(search.page),
    paymentStatus:
      typeof search.paymentStatus === "string"
        ? search.paymentStatus
        : undefined,
    search: typeof search.search === "string" ? search.search : undefined,
    sortBy: parseSortBySearch(search.sortBy),
    sortDirection: parseSortDirectionSearch(search.sortDirection),
    status: typeof search.status === "string" ? search.status : undefined,
  }),
});

function AdminBookingsPage() {
  const searchParams = Route.useSearch();
  const { isAllowed } = useAdminAccess("/admin/bookings");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(searchParams.page ?? 1);
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [status, setStatus] = useState(searchParams.status ?? "all");
  const [paymentStatus, setPaymentStatus] = useState(
    searchParams.paymentStatus ?? "all",
  );
  const [sortBy, setSortBy] = useState<AdminBookingSortBy>(
    searchParams.sortBy ?? "createdAt",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    searchParams.sortDirection ?? "desc",
  );
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const bookingsQuery = useQuery({
    enabled: isAllowed,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchAdminBookings({
        page,
        pageSize: PAGE_SIZE,
        paymentStatus,
        search: debouncedSearch,
        sortBy,
        sortDirection,
        status,
      }),
    queryKey: [
      "admin-bookings",
      page,
      PAGE_SIZE,
      debouncedSearch,
      status,
      paymentStatus,
      sortBy,
      sortDirection,
    ],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      updateAdminBookingStatus(id, nextStatus),
    onError: (error) => {
      setActionMessage("");
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to update booking status.",
      );
    },
    onSuccess: async (booking) => {
      setActionError("");
      setActionMessage(
        `${booking.confirmationCode} was marked ${booking.status}.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
    },
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (nextSortBy: AdminBookingSortBy) => {
      setSortDirection((currentDirection) =>
        sortBy === nextSortBy && currentDirection === "asc" ? "desc" : "asc",
      );
      setSortBy(nextSortBy);
      setPage(1);
    },
    [sortBy],
  );

  if (!isAllowed) {
    return <AdminLoadingState />;
  }

  if (bookingsQuery.isError) {
    return (
      <AdminErrorState
        error={bookingsQuery.error}
        title="Unable To Load Bookings"
      />
    );
  }

  const result = bookingsQuery.data;
  const bookings = result?.items ?? [];
  const totalCount = result?.totalCount ?? 0;

  return (
    <AdminShell title="Bookings">
      <div className="px-4 py-6 lg:px-7">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Reservation Management</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, confirm, and cancel customer reservations.
                </p>
              </div>
              <Badge variant="outline">{totalCount} bookings</Badge>
            </CardHeader>
            <CardContent>
              <BookingsToolbar
                paymentStatus={paymentStatus}
                search={search}
                status={status}
                onPaymentStatusChange={(value) => {
                  setPaymentStatus(value);
                  setPage(1);
                }}
                onSearchChange={handleSearchChange}
                onStatusChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              />
            </CardContent>
          </Card>

          {actionError ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}

          {actionMessage ? (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Booking updated</AlertTitle>
              <AlertDescription>{actionMessage}</AlertDescription>
            </Alert>
          ) : null}

          <BookingsTable
            bookings={bookings}
            hasMore={result?.hasMore ?? false}
            isFetching={bookingsQuery.isFetching}
            page={page}
            pageSize={PAGE_SIZE}
            sortBy={sortBy}
            sortDirection={sortDirection}
            totalCount={totalCount}
            updatingId={updateStatusMutation.variables?.id}
            onPageChange={setPage}
            onSortChange={handleSortChange}
            onUpdateStatus={(id, nextStatus) => {
              setActionError("");
              setActionMessage("");
              updateStatusMutation.mutate({ id, nextStatus });
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}

function BookingsToolbar({
  paymentStatus,
  search,
  status,
  onPaymentStatusChange,
  onSearchChange,
  onStatusChange,
}: {
  paymentStatus: string;
  search: string;
  status: string;
  onPaymentStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search code, customer, vehicle, plate..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Booking status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bookings</SelectItem>
            {BOOKING_STATUSES.map((bookingStatus) => (
              <SelectItem key={bookingStatus} value={bookingStatus}>
                {bookingStatus}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT_STATUSES.map((nextPaymentStatus) => (
              <SelectItem key={nextPaymentStatus} value={nextPaymentStatus}>
                {nextPaymentStatus}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SortButton({
  activeSort,
  direction,
  label,
  onSortChange,
  sortKey,
}: {
  activeSort: AdminBookingSortBy;
  direction: SortDirection;
  label: string;
  onSortChange: (sortBy: AdminBookingSortBy) => void;
  sortKey: AdminBookingSortBy;
}) {
  const isActive = activeSort === sortKey;

  return (
    <Button className="-ml-2" variant="ghost" onClick={() => onSortChange(sortKey)}>
      {label}
      <ArrowUpDown
        className={cn(isActive && direction === "desc" && "rotate-180")}
      />
    </Button>
  );
}

function BookingsTable({
  bookings,
  hasMore,
  isFetching,
  page,
  pageSize,
  sortBy,
  sortDirection,
  totalCount,
  updatingId,
  onPageChange,
  onSortChange,
  onUpdateStatus,
}: {
  bookings: AdminBooking[];
  hasMore: boolean;
  isFetching: boolean;
  page: number;
  pageSize: number;
  sortBy: AdminBookingSortBy;
  sortDirection: SortDirection;
  totalCount: number;
  updatingId?: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: AdminBookingSortBy) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Booking"
                  sortKey="createdAt"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Customer"
                  sortKey="customer"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Vehicle"
                  sortKey="vehicle"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Dates"
                  sortKey="date"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Status"
                  sortKey="status"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  activeSort={sortBy}
                  direction={sortDirection}
                  label="Total"
                  sortKey="total"
                  onSortChange={onSortChange}
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length ? (
              bookings.map((booking) => {
                const isUpdating = updatingId === booking.id;
                const canConfirm =
                  booking.status === "Pending" && booking.paymentStatus === "Paid";
                const canCancel =
                  booking.status !== "Cancelled" &&
                  booking.status !== "Completed";

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="min-w-[150px]">
                        <p className="font-medium">{booking.confirmationCode}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[180px]">
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.customerEmail || "Registered account"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[190px]">
                        <Link
                          className="font-medium hover:text-primary"
                          to="/admin/inventory/$vehicleId"
                          params={{ vehicleId: booking.vehicleId }}
                        >
                          {booking.vehicleSummary}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {booking.licensePlate || "No plate"} · {booking.vehicleStatus}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[170px] text-sm">
                        <p>{format(parseISO(booking.startDate), "MMM d, yyyy")}</p>
                        <p className="text-muted-foreground">
                          Return {format(parseISO(booking.endDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-[150px] flex-wrap gap-2">
                        <BookingStatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(booking.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canConfirm || isUpdating}
                          onClick={() => onUpdateStatus(booking.id, "Confirmed")}
                        >
                          {isUpdating && canConfirm ? (
                            <Loader2 data-icon="inline-start" className="animate-spin" />
                          ) : (
                            <CalendarCheck data-icon="inline-start" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canCancel || isUpdating}
                          onClick={() => onUpdateStatus(booking.id, "Cancelled")}
                        >
                          {isUpdating && canCancel ? (
                            <Loader2 data-icon="inline-start" className="animate-spin" />
                          ) : (
                            <XCircle data-icon="inline-start" />
                          )}
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  className="h-28 text-center text-muted-foreground"
                  colSpan={7}
                >
                  No bookings match the current query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstItem}-{lastItem} of {totalCount} bookings · Page {page}{" "}
          of {totalPages}
          {isFetching ? " · Refreshing" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  return (
    <Badge
      className={cn(
        normalized === "confirmed" && "bg-sky-50 text-sky-700",
        normalized === "completed" && "bg-emerald-50 text-emerald-700",
        normalized === "cancelled" && "bg-rose-50 text-rose-700",
        normalized === "pending" && "bg-amber-50 text-amber-700",
      )}
      variant="secondary"
    >
      {status}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "Paid" ? "default" : "outline"}>{status}</Badge>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
