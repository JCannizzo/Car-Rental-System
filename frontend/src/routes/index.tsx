import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { VEHICLE_CATEGORIES, type VehicleCategory } from "@/lib/api";
import { addDays, format } from "date-fns";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const testimonials = [
  {
    quote:
      "Pickup took less than ten minutes, the price matched what I saw online, and the car was spotless.",
    name: "Maya Thompson",
    trip: "Weekend rental",
    rating: "5.0",
  },
  {
    quote:
      "I rent here for client visits because it is local, predictable, and easy to get someone on the phone.",
    name: "Jordan Lee",
    trip: "Business trip",
    rating: "4.9",
  },
  {
    quote:
      "No pressure at the counter, no surprise add-ons, and the return process was just as quick.",
    name: "Andre Wilson",
    trip: "Family visit",
    rating: "5.0",
  },
];

function HomePage() {
  const navigate = Route.useNavigate();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), 1),
    to: addDays(new Date(), 8),
  });
  const [vehicleType, setVehicleType] = useState<VehicleCategory | "any">(
    "any",
  );

  const dateLabel = date?.from
    ? date.to
      ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
      : format(date.from, "LLL dd, y")
    : "Pick dates";

  const handleAvailabilitySubmit = (event: FormEvent) => {
    event.preventDefault();

    void navigate({
      to: "/browse",
      search: {
        startDate:
          date?.from && date?.to ? format(date.from, "yyyy-MM-dd") : undefined,
        endDate:
          date?.from && date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
        category: vehicleType === "any" ? undefined : vehicleType,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#141a1f]">
      <section className="relative min-h-[860px] overflow-hidden border-b border-[#dfded8] bg-[#e6ebe1] lg:min-h-[940px]">
        <div className="absolute inset-0">
          <img
            src="/landing-assets/hero-crossover.png"
            alt="Premium rental crossover driving along a coastal highway"
            className="h-full w-full object-cover object-[58%_60%]"
          />
        </div>

        <div className="relative mx-auto grid min-h-[860px] max-w-7xl items-center px-5 py-14 sm:px-6 lg:min-h-[940px] lg:grid-cols-[540px_1fr] lg:py-20">
          <div className="z-10 max-w-[560px] rounded-lg border border-white/75 bg-white/[0.94] p-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-7">
            <h1 className="text-5xl leading-[1.02] font-black tracking-normal text-[#101417] sm:text-6xl lg:text-7xl">
              Rent the right car for every drive
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4f555b]">
              One local rental office, a dependable fleet, and simple pricing
              for errands, weekend plans, and business trips.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleAvailabilitySubmit}>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
                <div className="grid min-w-0 gap-2">
                  <FormLabel>Pick-up & return</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-12 min-w-0 items-center gap-3 rounded-md border border-[#deded8] bg-white px-4 text-left text-sm text-[#4f555b] outline-none transition-colors hover:border-[#105645]/50 focus-visible:border-[#105645] focus-visible:ring-3 focus-visible:ring-[#105645]/20"
                      >
                        <CalendarDays className="text-[#105645]" />
                        <span className="truncate">{dateLabel}</span>
                      </button>
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
                </div>
                <div className="grid min-w-0 gap-2">
                  <FormLabel>Vehicle type</FormLabel>
                  <Select
                    value={vehicleType}
                    onValueChange={(value) =>
                      setVehicleType(value as VehicleCategory | "any")
                    }
                  >
                    <SelectTrigger
                      size="lg"
                      className="w-full rounded-md border-[#deded8] bg-white px-3 text-[#4f555b]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Car className="text-[#105645]" />
                        <SelectValue placeholder="Any vehicle" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any vehicle</SelectItem>
                      {VEHICLE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 rounded-md bg-[#105645] text-white hover:bg-[#174f43]"
              >
                Check availability
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#4f555b]">
              {["Free cancellation", "No hidden fees", "24/7 support"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="text-[#105645]" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div aria-hidden="true" />
        </div>
      </section>

      <section id="testimonials" className="px-5 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="rounded-md border-[#105645]/20 bg-transparent text-[#105645]"
            >
              Testimonials
            </Badge>
            <h2 className="mt-3 text-4xl leading-tight font-black tracking-normal">
              Trusted by local drivers
            </h2>
            <p className="mt-2 text-[#646970]">
              Straightforward rentals, clean cars, and a pickup process people
              come back for.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="rounded-lg border-[#deded8] bg-white py-0 shadow-sm"
              >
                <CardHeader className="px-5 pt-5">
                  <div className="flex items-center gap-1 text-[#105645]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-2xl font-black">
                    {testimonial.rating}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <blockquote className="text-base leading-7 text-[#33383d]">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-6 border-t border-[#deded8] pt-4">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-[#646970]">{testimonial.trip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#deded8] bg-white px-5 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge className="rounded-md bg-[#105645] text-white">
              Local service
            </Badge>
            <h2 className="mt-4 max-w-xl text-4xl leading-tight font-black tracking-normal">
              A simpler rental experience from a team you can actually reach.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["One pickup point", "No guessing where to go on rental day."],
              ["Clear prices", "Daily and weekly rates shown up front."],
              ["Ready vehicles", "A focused fleet maintained for local trips."],
            ].map(([title, body]) => (
              <div key={title} className="border-l border-[#deded8] pl-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#646970]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-7 text-sm text-[#646970] sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CarRental.</span>
          <span>Local fleet · Transparent pricing · Fast pickup</span>
        </div>
      </footer>
    </main>
  );
}

function FormLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-bold tracking-normal text-[#41474d] uppercase">
      {children}
    </span>
  );
}
