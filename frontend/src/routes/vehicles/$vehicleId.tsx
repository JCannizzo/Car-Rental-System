import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { createBooking, fetchVehicle, type Vehicle } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Car,
  CheckCircle2,
  DoorOpen,
  Fuel,
  Gauge,
  Loader2,
  Settings2,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

interface VehicleSearchParams {
  startDate?: string;
  endDate?: string;
}

export const Route = createFileRoute("/vehicles/$vehicleId")({
  component: VehicleDetail,
  validateSearch: (search: Record<string, unknown>): VehicleSearchParams => ({
    startDate: search.startDate as string | undefined,
    endDate: search.endDate as string | undefined,
  }),
});

function VehicleDetail() {
  const { vehicleId } = Route.useParams();
  const { startDate: searchStart, endDate: searchEnd } = Route.useSearch();

  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="min-h-[60vh] bg-background px-5 py-12 text-center sm:px-6">
        <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8 shadow-sm">
          <p className="text-xl font-black text-card-foreground">Vehicle not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
          The vehicle you're looking for doesn't exist or is unavailable.
          </p>
          <Button
            variant="outline"
            className="mt-5 rounded-md border-border"
            asChild
          >
            <Link to="/browse">Back to listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VehicleDetailContent
      vehicle={vehicle}
      initialStartDate={searchStart}
      initialEndDate={searchEnd}
    />
  );
}

function VehicleDetailContent({
  vehicle,
  initialStartDate,
  initialEndDate,
}: {
  vehicle: Vehicle;
  initialStartDate?: string;
  initialEndDate?: string;
}) {
  const [activeImage, setActiveImage] = useState<"side" | "front">("side");
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (initialStartDate && initialEndDate) {
      return {
        from: parseISO(initialStartDate),
        to: parseISO(initialEndDate),
      };
    }
    return undefined;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const days =
    date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;
  const totalPrice = days * vehicle.pricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);

    if (!date?.from || !date?.to || days < 1) {
      setDateError("Select pick-up & return dates");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createBooking({
        vehicleId: vehicle.id,
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      });

      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        // Fallback if no checkout URL (e.g. Stripe not configured)
        window.location.href = `/booking/confirmation/${result.confirmationCode}`;
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setIsSubmitting(false);
    }
  };

  const imageUrl =
    activeImage === "side" ? vehicle.imageUrl : vehicle.imageUrlFront;
  const dateLabel = date?.from
    ? date.to
      ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
      : format(date.from, "LLL dd, y")
    : "Select dates";

  const specs = [
    { icon: CalendarIcon, label: "Year", value: vehicle.year },
    {
      icon: Gauge,
      label: "Mileage",
      value: `${vehicle.mileage.toLocaleString()} mi`,
    },
    { icon: DoorOpen, label: "Doors", value: vehicle.doors },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Fuel", value: vehicle.fuelType },
    { icon: Users, label: "Seats", value: vehicle.seats },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:py-8">
        <Link
          to="/browse"
          search={{
            startDate: initialStartDate,
            endDate: initialEndDate,
          }}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-5">
            {isImageExpanded && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
                onClick={() => setIsImageExpanded(false)}
              >
                <img
                  src={imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="max-h-[90vh] max-w-[90vw] rounded-lg border border-card/40 bg-card object-contain shadow-2xl"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsImageExpanded(false);
                  }}
                />
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="rounded-md border-primary/20 bg-background text-primary"
                  >
                    {vehicle.category}
                  </Badge>
                  <h1 className="mt-3 text-4xl font-black leading-tight tracking-normal text-card-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Clean, ready, and priced clearly for local pickup.
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <p className="text-4xl font-black leading-none text-card-foreground">
                    ${vehicle.pricePerDay}
                  </p>
                  <p className="text-sm text-muted-foreground">per day</p>
                </div>
              </div>

              <div className="mt-5 border-y border-border py-5">
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-md bg-card text-left"
                  onClick={() => setIsImageExpanded(true)}
                >
                  <img
                    src={imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </button>

                <div className="mt-3 flex gap-2">
                  <ImageThumb
                    active={activeImage === "side"}
                    imageUrl={vehicle.imageUrl}
                    label="Side view"
                    onClick={() => setActiveImage("side")}
                  />
                  <ImageThumb
                    active={activeImage === "front"}
                    imageUrl={vehicle.imageUrlFront}
                    label="Front view"
                    onClick={() => setActiveImage("front")}
                  />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-sm font-bold uppercase tracking-normal text-muted-foreground">
                  Specifications
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                        <spec.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{spec.label}</p>
                        <p className="truncate text-sm font-bold text-card-foreground">
                          {spec.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {vehicle.features.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-normal text-muted-foreground">
                    Features
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vehicle.features.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="border-b border-border pb-5">
                <p className="text-sm font-bold uppercase tracking-normal text-primary">
                  Reserve this car
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-normal text-card-foreground">
                  Choose your rental dates
                </h2>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {["Free cancellation", "No hidden fees", "Secure checkout"].map(
                    (item) => (
                      <span key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Field>
                  <FieldLabel className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
                    Pick-up & return
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full justify-start rounded-md border-border bg-card px-3 font-normal text-muted-foreground hover:border-primary/50"
                      >
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="truncate">{dateLabel}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={{ before: addDays(new Date(), 1) }}
                      />
                    </PopoverContent>
                  </Popover>
                  {dateError && <FieldError>{dateError}</FieldError>}
                </Field>

                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${vehicle.pricePerDay} x {Math.max(days, 1)} day
                      {Math.max(days, 1) !== 1 && "s"}
                    </span>
                    <span className="font-bold text-card-foreground">
                      ${days > 0 ? totalPrice : vehicle.pricePerDay}
                    </span>
                  </div>
                  <Separator className="my-3 bg-border" />
                  <div className="flex justify-between text-lg font-black text-card-foreground">
                    <span>Total</span>
                    <span>${days > 0 ? totalPrice : vehicle.pricePerDay}</span>
                  </div>
                  {days === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Select dates to calculate the full trip total.
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-md bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      <Car className="h-4 w-4" />
                      Book now
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  You'll be redirected to Stripe to complete payment.
                </p>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ImageThumb({
  active,
  imageUrl,
  label,
  onClick,
}: {
  active: boolean;
  imageUrl: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-md border-2 bg-card transition-colors ${
        active
          ? "border-primary"
          : "border-border hover:border-primary/40"
      }`}
    >
      <img src={imageUrl} alt={label} className="h-16 w-24 object-cover" />
    </button>
  );
}
