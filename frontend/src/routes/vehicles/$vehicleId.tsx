import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  createBooking,
  fetchVehicle,
  type CreateBookingRequest,
  type Vehicle,
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { differenceInDays, format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Car,
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
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-lg font-medium">Vehicle not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          The vehicle you're looking for doesn't exist or is unavailable.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/">Back to listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <VehicleDetailContent
      vehicle={vehicle}
      initialStartDate={searchStart}
      initialEndDate={searchEnd}
      onBookingCreated={(code) =>
        navigate({
          to: "/booking/confirmation/$code",
          params: { code },
        })
      }
    />
  );
}

function VehicleDetailContent({
  vehicle,
  initialStartDate,
  initialEndDate,
  onBookingCreated,
}: {
  vehicle: Vehicle;
  initialStartDate?: string;
  initialEndDate?: string;
  onBookingCreated: (code: string) => void;
}) {
  const [activeImage, setActiveImage] = useState<"side" | "front">("side");

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (initialStartDate && initialEndDate) {
      return {
        from: parseISO(initialStartDate),
        to: parseISO(initialEndDate),
      };
    }
    return undefined;
  });

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const days =
    date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;
  const totalPrice = days * vehicle.pricePerDay;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!date?.from || !date?.to) errors.date = "Select pick-up & return dates";
    if (days < 1) errors.date = "Minimum rental is 1 day";
    if (!guestName.trim()) errors.guestName = "Name is required";
    if (!guestEmail.trim()) errors.guestEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail))
      errors.guestEmail = "Enter a valid email";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload: CreateBookingRequest = {
      vehicleId: vehicle.id,
      startDate: format(date!.from!, "yyyy-MM-dd"),
      endDate: format(date!.to!, "yyyy-MM-dd"),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim() || undefined,
    };

    try {
      const result = await createBooking(payload);
      onBookingCreated(result.confirmationCode);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrl =
    activeImage === "side" ? vehicle.imageUrl : vehicle.imageUrlFront;

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        {/* Left column - Image & details */}
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
            <img
              src={imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full aspect-[16/10] object-cover"
            />
          </div>

          {/* Image toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveImage("side")}
              className={`rounded-lg overflow-hidden border-2 transition-colors ${
                activeImage === "side"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <img
                src={vehicle.imageUrl}
                alt="Side view"
                className="w-20 h-14 object-cover"
              />
            </button>
            <button
              onClick={() => setActiveImage("front")}
              className={`rounded-lg overflow-hidden border-2 transition-colors ${
                activeImage === "front"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <img
                src={vehicle.imageUrlFront}
                alt="Front view"
                className="w-20 h-14 object-cover"
              />
            </button>
          </div>

          {/* Specs grid */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center gap-2.5 rounded-lg border border-border p-3"
                >
                  <spec.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {spec.label}
                    </p>
                    <p className="text-sm font-medium truncate">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          {vehicle.features.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Header + Booking form */}
        <div className="lg:sticky lg:top-[80px] lg:self-start space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{vehicle.category}</Badge>
            </div>
            <h1 className="text-2xl font-semibold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">
                ${vehicle.pricePerDay}
              </span>
              <span className="text-muted-foreground">/day</span>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Pick-up & Return Dates</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start px-2.5 font-normal"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Select dates
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {fieldErrors.date && <FieldError>{fieldErrors.date}</FieldError>}
            </Field>

            {days > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${vehicle.pricePerDay} x {days} day{days !== 1 && "s"}
                  </span>
                  <span className="font-medium">${totalPrice}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="guestName">Full Name</FieldLabel>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Doe"
                aria-invalid={!!fieldErrors.guestName}
              />
              {fieldErrors.guestName && (
                <FieldError>{fieldErrors.guestName}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="guestEmail">Email</FieldLabel>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="john@example.com"
                aria-invalid={!!fieldErrors.guestEmail}
              />
              {fieldErrors.guestEmail && (
                <FieldError>{fieldErrors.guestEmail}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="guestPhone">
                Phone{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="guestPhone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </Field>

            {submitError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Car className="h-4 w-4" />
                  Book Now
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
