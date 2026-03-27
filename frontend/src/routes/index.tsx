import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import VehicleCard from "@/components/vehicle-card";
import {
  fetchVehicles,
  FUEL_TYPES,
  SEAT_OPTIONS,
  TRANSMISSION_TYPES,
  VEHICLE_CATEGORIES,
  type FuelType,
  type TransmissionType,
  type VehicleCategory,
  type VehicleQueryParams,
} from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { CalendarIcon, Loader2, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/")({
  component: Index,
});

const PAGE_SIZE = 20;
const MAX_PRICE = 300;

function Index() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [category, setCategory] = useState<VehicleCategory | undefined>();
  const [transmission, setTransmission] = useState<
    TransmissionType | undefined
  >();
  const [fuelType, setFuelType] = useState<FuelType | undefined>();
  const [minSeats, setMinSeats] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE);

  const filters = useMemo<Omit<VehicleQueryParams, "cursor" | "pageSize">>(
    () => ({
      startDate:
        date?.from && date?.to ? format(date.from, "yyyy-MM-dd") : undefined,
      endDate:
        date?.from && date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
      category,
      transmissionType: transmission,
      fuelType,
      minSeats,
      maxPricePerDay: maxPrice < MAX_PRICE ? maxPrice : undefined,
    }),
    [date, category, transmission, fuelType, minSeats, maxPrice],
  );

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const moreFilterCount = [
    transmission,
    fuelType,
    minSeats,
    maxPrice < MAX_PRICE ? maxPrice : undefined,
  ].filter(Boolean).length;

  const totalFilterCount = moreFilterCount + (category ? 1 : 0);

  // Auto-expand if any "more" filters are active
  useEffect(() => {
    if (moreFilterCount > 0) setShowMoreFilters(true);
  }, [moreFilterCount]);

  const clearMoreFilters = () => {
    setTransmission(undefined);
    setFuelType(undefined);
    setMinSeats(undefined);
    setMaxPrice(MAX_PRICE);
  };

  const clearAllFilters = () => {
    setCategory(undefined);
    clearMoreFilters();
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["vehicles", filters],
    queryFn: ({ pageParam }) =>
      fetchVehicles({ ...filters, cursor: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const vehicles = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <>
      <div className="sticky top-[65px] z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <Field className="flex min-w-0 flex-1 md:flex-none md:w-60">
              <FieldLabel htmlFor="date-picker-range">
                Pick-up & Return Dates
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker-range"
                    className="justify-start px-2.5 font-normal"
                  >
                    <CalendarIcon />
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
                      <span>Pick a date</span>
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
            </Field>

            {/* Mobile */}
            <div className="flex items-end gap-2 md:hidden shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {totalFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {totalFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 flex flex-col gap-4"
                >
                  <Field className="flex">
                    <FieldLabel>Category</FieldLabel>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="flex-wrap justify-start"
                      value={category ?? ""}
                      onValueChange={(val) =>
                        setCategory(val ? (val as VehicleCategory) : undefined)
                      }
                    >
                      {VEHICLE_CATEGORIES.map((cat) => (
                        <ToggleGroupItem
                          key={cat}
                          value={cat}
                          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {cat}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>

                  <Field className="flex">
                    <FieldLabel>Transmission</FieldLabel>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="flex-wrap justify-start"
                      value={transmission ?? ""}
                      onValueChange={(val) =>
                        setTransmission(
                          val ? (val as TransmissionType) : undefined,
                        )
                      }
                    >
                      {TRANSMISSION_TYPES.map((t) => (
                        <ToggleGroupItem
                          key={t}
                          value={t}
                          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {t}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>

                  <Field className="flex">
                    <FieldLabel>Fuel Type</FieldLabel>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="flex-wrap justify-start"
                      value={fuelType ?? ""}
                      onValueChange={(val) =>
                        setFuelType(val ? (val as FuelType) : undefined)
                      }
                    >
                      {FUEL_TYPES.map((f) => (
                        <ToggleGroupItem
                          key={f}
                          value={f}
                          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {f}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>

                  <Field className="flex">
                    <FieldLabel>Seats</FieldLabel>
                    <Select
                      value={minSeats != null ? String(minSeats) : "any"}
                      onValueChange={(val) =>
                        setMinSeats(val === "any" ? undefined : Number(val))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEAT_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.label}
                            value={
                              opt.value != null ? String(opt.value) : "any"
                            }
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="flex">
                    <FieldLabel>
                      Max Price{" "}
                      <span className="text-muted-foreground font-normal">
                        {maxPrice < MAX_PRICE ? `$${maxPrice}/day` : "Any"}
                      </span>
                    </FieldLabel>
                    <Slider
                      min={10}
                      max={MAX_PRICE}
                      step={5}
                      value={[maxPrice]}
                      onValueChange={([val]) => setMaxPrice(val)}
                    />
                  </Field>

                  {totalFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      className="text-muted-foreground w-full"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear all ({totalFilterCount})
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-end gap-3">
              <Field className="flex">
                <FieldLabel>Category</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={category ?? ""}
                  onValueChange={(val) =>
                    setCategory(val ? (val as VehicleCategory) : undefined)
                  }
                >
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <ToggleGroupItem
                      key={cat}
                      value={cat}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {cat}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <Button
                variant={showMoreFilters ? "secondary" : "outline"}
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className="relative"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                More Filters
                {!showMoreFilters && moreFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {moreFilterCount}
                  </span>
                )}
              </Button>

              {totalFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all ({totalFilterCount})
                </Button>
              )}
            </div>
          </div>
          {showMoreFilters && (
            <div className="hidden md:flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-border pt-3">
              <Field className="flex">
                <FieldLabel>Transmission</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={transmission ?? ""}
                  onValueChange={(val) =>
                    setTransmission(val ? (val as TransmissionType) : undefined)
                  }
                >
                  {TRANSMISSION_TYPES.map((t) => (
                    <ToggleGroupItem
                      key={t}
                      value={t}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {t}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <Field className="flex">
                <FieldLabel>Fuel Type</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={fuelType ?? ""}
                  onValueChange={(val) =>
                    setFuelType(val ? (val as FuelType) : undefined)
                  }
                >
                  {FUEL_TYPES.map((f) => (
                    <ToggleGroupItem
                      key={f}
                      value={f}
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {f}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <Field className="flex">
                <FieldLabel>Seats</FieldLabel>
                <Select
                  value={minSeats != null ? String(minSeats) : "any"}
                  onValueChange={(val) =>
                    setMinSeats(val === "any" ? undefined : Number(val))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEAT_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.label}
                        value={opt.value != null ? String(opt.value) : "any"}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="flex w-48">
                <FieldLabel>
                  Max Price{" "}
                  <span className="text-muted-foreground font-normal">
                    {maxPrice < MAX_PRICE ? `$${maxPrice}/day` : "Any"}
                  </span>
                </FieldLabel>
                <Slider
                  min={10}
                  max={MAX_PRICE}
                  step={5}
                  value={[maxPrice]}
                  onValueChange={([val]) => setMaxPrice(val)}
                />
              </Field>

              {moreFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearMoreFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear ({moreFilterCount})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="text-center py-12 text-destructive">
            <p>Failed to load vehicles</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        )}
        {data && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {totalCount} Available Car{totalCount !== 1 && "s"}
            </p>
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No vehicles match your filters
                </p>
                {(category || moreFilterCount > 0) && (
                  <Button
                    variant="link"
                    onClick={clearAllFilters}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border border border-border rounded-lg overflow-hidden">
                {vehicles.map((car) => (
                  <VehicleCard
                    key={car.id}
                    vehicle={car}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                  />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!hasNextPage && vehicles.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
                You've reached the end
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
