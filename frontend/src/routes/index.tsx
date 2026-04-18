import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Clock, Star } from "lucide-react";

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">

      <section className="flex flex-col items-center justify-center text-center px-4 py-20 gap-6">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Find the perfect car for your journey
        </h1>
        <p className="text-muted-foreground max-w-xl">
            Browse hundreds of vehicles, compare prices, and book your ride in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/browse">
            <Button size="lg">Browse Vehicles</Button>
          </Link>
        </div>

      </section>

      {/* spacing */}
      <div className="h-20" />

      {/* Features / trust */}
      <section className="grid sm:grid-cols-3 gap-6 px-6 pb-16 max-w-5xl mx-auto text-center">
        <div className="flex flex-col items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">Top Rated</h3>
          <p className="text-sm text-muted-foreground">
            Trusted by thousands of customers
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">Quick Booking</h3>
          <p className="text-sm text-muted-foreground">
            Book your car in minutes
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h3 className="font-semibold">No Hidden Fees</h3>
          <p className="text-sm text-muted-foreground">
            Transparent pricing always
          </p>
        </div>
      </section>

      {/* Promo Section */}
      <section className="bg-muted py-12 px-6 text-center">
        <h2 className="text-2xl font-bold">Save more with weekly rentals</h2>
        <p className="text-muted-foreground mt-2">
          Get discounts when you book for longer trips.
        </p>

        <Link to="/browse">
          <Button className="mt-4">Explore Deals</Button>
        </Link>
      </section>

      {/* Browse Category */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Browse by Category
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {["SUV", "Sedan", "Truck", "Luxury"].map((cat) => (
            <div
              key={cat}
              className="border rounded-lg p-6 text-center hover:shadow-md transition"
            >
              <h3 className="font-semibold">{cat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-primary text-primary-foreground py-16 text-center px-6">
        <h2 className="text-3xl font-bold">
          Ready to hit the road?
        </h2>
        <p className="mt-2">
          Book your car today and start your journey.
        </p>

        <Link to="/browse">
          <Button size="lg" variant="secondary" className="mt-4">
            Browse Vehicles
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CarRental. All rights reserved.
      </footer>
    </main>
  );
}
