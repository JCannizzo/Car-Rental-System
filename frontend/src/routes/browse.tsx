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
  SEAT_OPTIONS,
  TRANSMISSION_TYPES,
  VEHICLE_CATEGORIES,
  type TransmissionType,
  type VehicleCategory,
  type VehicleQueryParams,
} from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, isValid, parseISO } from "date-fns";
import { CalendarIcon, Loader2, SlidersHorizontal, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DateRange } from "react-day-picker";

const PAGE_SIZE = 20;
const MAX_PRICE = 300;

interface BrowseSearchParams {
  startDate?: string;
  endDate?: string;
  category?: VehicleCategory;
  transmissionType?: TransmissionType;
  minSeats?: number;
  maxPricePerDay?: number;
}

function parseDateSearch(value: unknown) {
  if (typeof value !== "string") return undefined;

  const date = parseISO(value);

  return isValid(date) ? format(date, "yyyy-MM-dd") : undefined;
}

function parseCategorySearch(value: unknown) {
  return VEHICLE_CATEGORIES.includes(value as VehicleCategory)
    ? (value as VehicleCategory)
    : undefined;
}

function parseTransmissionSearch(value: unknown) {
  return TRANSMISSION_TYPES.includes(value as TransmissionType)
    ? (value as TransmissionType)
    : undefined;
}

function parseNumberSearch(value: unknown) {
  const numericValue =
    typeof value === "string" || typeof value === "number"
      ? Number(value)
      : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function getInitialDateRange(search: BrowseSearchParams): DateRange | undefined {
  if (!search.startDate || !search.endDate) {
    return {
      from: addDays(new Date(), 1),
      to: addDays(new Date(), 8),
    };
  }

  return {
    from: parseISO(search.startDate),
    to: parseISO(search.endDate),
  };
}

export const Route = createFileRoute("/browse")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): BrowseSearchParams => ({
    startDate: parseDateSearch(search.startDate),
    endDate: parseDateSearch(search.endDate),
    category: parseCategorySearch(search.category),
    transmissionType: parseTransmissionSearch(search.transmissionType),
    minSeats: parseNumberSearch(search.minSeats),
    maxPricePerDay: parseNumberSearch(search.maxPricePerDay),
  }),
});

function Index() {
  const search = Route.useSearch();
  const [date, setDate] = useState<DateRange | undefined>(() =>
    getInitialDateRange(search),
  );

  const [category, setCategory] = useState<VehicleCategory | undefined>(
    search.category,
  );
  const [transmission, setTransmission] = useState<
    TransmissionType | undefined
  >(search.transmissionType);
  const [minSeats, setMinSeats] = useState<number | undefined>(
    search.minSeats,
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    search.maxPricePerDay ?? MAX_PRICE,
  );

  const filters = useMemo<Omit<VehicleQueryParams, "cursor" | "pageSize">>(
    () => ({
      startDate:
        date?.from && date?.to ? format(date.from, "yyyy-MM-dd") : undefined,
      endDate:
        date?.from && date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
      category,
      transmissionType: transmission,
      minSeats,
      maxPricePerDay: maxPrice < MAX_PRICE ? maxPrice : undefined,
    }),
    [date, category, transmission, minSeats, maxPrice],
  );

  const moreFilterCount = [
    transmission,
    minSeats,
    maxPrice < MAX_PRICE ? maxPrice : undefined,
  ].filter(Boolean).length;

  const totalFilterCount = moreFilterCount + (category ? 1 : 0);

  const clearAllFilters = () => {
    setCategory(undefined);
    setTransmission(undefined);
    setMinSeats(undefined);
    setMaxPrice(MAX_PRICE);
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
  const dateLabel = date?.from
    ? date.to
      ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
      : format(date.from, "LLL dd, y")
    : "Pick dates";

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

  const filtersPanel = (
    <div className="grid gap-5">
      <Field className="flex">
        <FieldLabel className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
          Pick-up & return
        </FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start rounded-md border-border bg-card px-3 font-normal text-muted-foreground hover:border-primary/50"
            >
              <CalendarIcon className="text-primary" />
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
      </Field>

      <FilterBlock label="Category">
        <Select
          value={category ?? "any"}
          onValueChange={(val) =>
            setCategory(val === "any" ? undefined : (val as VehicleCategory))
          }
        >
          <SelectTrigger className="h-12 w-full rounded-md border-border bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any category</SelectItem>
            {VEHICLE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBlock>

      <FilterBlock label="Transmission">
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={2}
          className="flex-wrap justify-start gap-2"
          value={transmission ?? ""}
          onValueChange={(val) =>
            setTransmission(val ? (val as TransmissionType) : undefined)
          }
        >
          {TRANSMISSION_TYPES.map((t) => (
            <ToggleGroupItem
              key={t}
              value={t}
              className="h-12 rounded-md border-border bg-card px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterBlock>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Field className="flex">
          <FieldLabel className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
            Seats
          </FieldLabel>
          <Select
            value={minSeats != null ? String(minSeats) : "any"}
            onValueChange={(val) =>
              setMinSeats(val === "any" ? undefined : Number(val))
            }
          >
            <SelectTrigger className="h-12 w-full rounded-md border-border bg-card">
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

        <Field className="flex">
          <FieldLabel className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
            Max price{" "}
            <span className="font-normal text-muted-foreground">
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
      </div>

      {totalFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="h-12 rounded-md border-border text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear all ({totalFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:py-8">
        <section className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="hidden rounded-lg border border-border bg-card p-5 shadow-sm lg:block">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-normal text-card-foreground">
                  Browse cars
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Filter by trip details.
                </p>
              </div>
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            {filtersPanel}
          </div>

          <div className="sticky top-[65px] z-40 -mx-5 border-b border-border bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-normal text-primary">
                  {totalCount || "Browse"} cars
                </p>
                <p className="truncate text-sm text-muted-foreground">{dateLabel}</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative h-12 shrink-0 rounded-md border-border bg-card"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {totalFilterCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {totalFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="max-h-[calc(100vh-96px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border-border p-4"
                >
                  {filtersPanel}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          {isLoading && (
            <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <div className="rounded-lg border border-border bg-card py-14 text-center text-destructive shadow-sm">
              <p className="font-bold">Failed to load vehicles</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            </div>
          )}
          {data && (
            <>
              <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-primary">
                    {totalCount} available car{totalCount !== 1 && "s"}
                  </p>
                  <h2 className="mt-1 text-3xl font-black tracking-normal text-card-foreground">
                    Fleet results
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Showing vehicles for {dateLabel}
                  {category ? ` in ${category}` : ""}.
                </p>
              </div>

              {vehicles.length === 0 ? (
                <div className="rounded-lg border border-border bg-card px-5 py-14 text-center shadow-sm">
                  <p className="text-lg font-bold text-card-foreground">
                    No vehicles match your filters
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Try a wider date range, another category, or a higher daily
                    price.
                  </p>
                  {totalFilterCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="mt-5 rounded-md border-border"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
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
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {!hasNextPage && vehicles.length > 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  You've reached the end
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
