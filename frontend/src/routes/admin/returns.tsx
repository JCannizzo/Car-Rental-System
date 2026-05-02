import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
fetchAdminBookings,
  markVehicleAsReady,
  returnAdminBooking,
  type AdminBooking,
  type ReturnBookingRequest,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays, format, parseISO, startOfToday } from "date-fns";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 350;

interface AdminReturnsSearchParams {
  page?: number;
  search?: string;
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

export const Route = createFileRoute("/admin/returns")({
  component: AdminReturnsPage,
  validateSearch: (search: Record<string, unknown>): AdminReturnsSearchParams => ({
    page: parsePageSearch(search.page),
    search: typeof search.search === "string" ? search.search : undefined,
  }),
});

function AdminReturnsPage() {
  const searchParams = Route.useSearch();
  const { isAllowed } = useAdminAccess("/admin/returns");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(searchParams.page ?? 1);
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  
  const returnsQuery = useQuery({
    enabled: isAllowed,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchAdminBookings({
        page,
        pageSize: PAGE_SIZE,
        paymentStatus: "Paid",
        search: debouncedSearch,
        sortBy: "returnDate",
        sortDirection: "asc",
        status: "Confirmed",
      }),
    queryKey: ["admin-returns", page, PAGE_SIZE, debouncedSearch],
    retry: false,
  });

  const returnMutation = useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: ReturnBookingRequest;
    }) => returnAdminBooking(bookingId, payload),
    onError: (error) => {
      setActionMessage("");
      setActionError(
        error instanceof ApiError ? error.message : "Unable to complete return.",
      );
    },
    onSuccess: async (booking) => {
      setSelectedBooking(null);
      setActionError("");
      setActionMessage(
        `${booking.confirmationCode} was completed and the vehicle is ${booking.vehicleStatus}.`,
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin-vehicle-inventory"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
    },
  });

const markReadyMutation = useMutation({
  mutationFn: (vehicleId: string) => markVehicleAsReady(vehicleId),
  onError: () => {
    setActionError("Failed to mark vehicle as ready.");
  },
  onSuccess: async () => {
    setActionError("");
    setActionMessage("Vehicle is now marked as Available.");
    await queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-vehicle-inventory"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
  },
});

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const bookings = returnsQuery.data?.items ?? [];
  const stats = useReturnStats(bookings);

  if (!isAllowed) {
    return <AdminLoadingState />;
  }

  if (returnsQuery.isError) {
    return (
      <AdminErrorState
        error={returnsQuery.error}
        title="Unable To Load Returns"
      />
    );
  }

  return (
    <AdminShell title="Returns">
      <div className="px-4 py-6 lg:px-7">
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <ReturnStatCard label="Overdue" tone="danger" value={stats.overdue} />
            <ReturnStatCard label="Due today" tone="warning" value={stats.dueToday} />
            <ReturnStatCard label="Upcoming" tone="neutral" value={stats.upcoming} />
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Return Queue</CardTitle>
                <CardDescription>
                  Complete check-ins and choose whether each vehicle is available
                  or needs maintenance.
                </CardDescription>
              </div>
              <Badge variant="outline">
                {returnsQuery.data?.totalCount ?? 0} active returns
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search code, customer, vehicle, plate..."
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {actionError ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Return failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}

          {actionMessage ? (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Return completed</AlertTitle>
              <AlertDescription>{actionMessage}</AlertDescription>
            </Alert>
          ) : null}

          <ReturnsTable
            bookings={bookings}
            hasMore={returnsQuery.data?.hasMore ?? false}
            isFetching={returnsQuery.isFetching}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={returnsQuery.data?.totalCount ?? 0}
            onMarkReady={(vehicleId) => markReadyMutation.mutate(vehicleId)}
            onOpenReturn={setSelectedBooking}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ReturnDialog
        booking={selectedBooking}
        isSubmitting={returnMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        onSubmit={(bookingId, payload) => {
          setActionError("");
          setActionMessage("");
          returnMutation.mutate({ bookingId, payload });
        }}
      />
    </AdminShell>
  );
}

function ReturnStatCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "danger" | "neutral" | "warning";
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn(
            "text-3xl",
            tone === "danger" && "text-destructive",
            tone === "warning" && "text-amber-700",
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function ReturnsTable({
  bookings,
  hasMore,
  isFetching,
  page,
  pageSize,
  totalCount,
  onMarkReady,
  onOpenReturn,
  onPageChange,
}: {
  bookings: AdminBooking[];
  hasMore: boolean;
  isFetching: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onMarkReady: (vehicleId: string) => void;
  onOpenReturn: (booking: AdminBooking) => void;
  onPageChange: (page: number) => void;
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
              <TableHead>Return</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Mileage</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="min-w-[160px]">
                      <p className="font-medium">{booking.confirmationCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(booking.endDate), "EEEE, MMM d")}
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
                    <div className="min-w-[200px]">
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
                    <ReturnDueBadge endDate={booking.endDate} />
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US").format(booking.vehicleMileage)} mi
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {booking.vehicleStatus === "Returned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => {
                            if (confirm("Is this vehicle cleaned and ready for the next customer?")) {
                              onMarkReady(booking.vehicleId);
                            }
                          }}
                        >
                          Mark as Ready
                        </Button>
                      )}
                      <Button size="sm" onClick={() => onOpenReturn(booking)}>
                        <RotateCcw data-icon="inline-start" />
                        Check in
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-28 text-center text-muted-foreground"
                  colSpan={6}
                >
                  No active returns match the current query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstItem}-{lastItem} of {totalCount} returns · Page {page}{" "}
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

function ReturnDialog({
  booking,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  booking: AdminBooking | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bookingId: string, payload: ReturnBookingRequest) => void;
}) {
  const [vehicleStatus, setVehicleStatus] =
    useState<ReturnBookingRequest["vehicleStatus"]>("Available");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setVehicleStatus("Available");
    setMileage(booking ? String(booking.vehicleMileage) : "");
    setNotes("");
  }, [booking]);

  const mileageValue = mileage.trim() ? Number(mileage) : undefined;
  const mileageInvalid =
    booking !== null &&
    mileageValue !== undefined &&
    (!Number.isInteger(mileageValue) || mileageValue < booking.vehicleMileage);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!booking || mileageInvalid) {
      return;
    }

    onSubmit(booking.id, {
      mileage: mileageValue,
      notes: notes.trim() || undefined,
      vehicleStatus,
    });
  };

  return (
    <Dialog open={booking !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Return</DialogTitle>
          <DialogDescription>
            {booking
              ? `${booking.confirmationCode} · ${booking.vehicleSummary}`
              : "Complete vehicle return"}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="return-status">Vehicle status</Label>
            <Select
              value={vehicleStatus}
              onValueChange={(value) =>
                setVehicleStatus(value as ReturnBookingRequest["vehicleStatus"])
              }
            >
              <SelectTrigger id="return-status">
                <SelectValue placeholder="Vehicle status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="return-mileage">Return mileage</Label>
            <Input
              id="return-mileage"
              inputMode="numeric"
              min={booking?.vehicleMileage ?? 0}
              type="number"
              value={mileage}
              aria-invalid={mileageInvalid}
              onChange={(event) => setMileage(event.target.value)}
            />
            {mileageInvalid ? (
              <p className="text-sm text-destructive">
                Mileage must be at least {booking?.vehicleMileage ?? 0}.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="return-notes">Notes</Label>
            <Textarea
              id="return-notes"
              placeholder="Damage, fuel, cleaning, or late-return notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mileageInvalid}>
              {isSubmitting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : vehicleStatus === "Maintenance" ? (
                <Wrench data-icon="inline-start" />
              ) : (
                <CheckCircle2 data-icon="inline-start" />
              )}
              Complete return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReturnDueBadge({ endDate }: { endDate: string }) {
  const dayDelta = differenceInCalendarDays(parseISO(endDate), startOfToday());

  if (dayDelta < 0) {
    return <Badge className="bg-rose-50 text-rose-700">Overdue</Badge>;
  }

  if (dayDelta === 0) {
    return <Badge className="bg-amber-50 text-amber-700">Due today</Badge>;
  }

  return <Badge variant="outline">In {dayDelta} days</Badge>;
}

function useReturnStats(bookings: AdminBooking[]) {
  return useMemo(() => {
    return bookings.reduce(
      (stats, booking) => {
        const dayDelta = differenceInCalendarDays(
          parseISO(booking.endDate),
          startOfToday(),
        );

        if (dayDelta < 0) {
          stats.overdue += 1;
        } else if (dayDelta === 0) {
          stats.dueToday += 1;
        } else {
          stats.upcoming += 1;
        }

        return stats;
      },
      { dueToday: 0, overdue: 0, upcoming: 0 },
    );
  }, [bookings]);
}
