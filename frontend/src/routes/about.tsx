import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <img
          src="landing-assets/about-1.jpg"
          alt="City driving lights"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white">
            CarRental Electrifies
          </h1>

          <div className="mt-4 h-1 w-24 bg-primary" />

          <p className="mt-6 max-w-2xl text-lg text-gray-200">
            Driving the future of transportation with smarter, cleaner, and more
            accessible vehicle rentals.
          </p>
        </div>
      </section>

      {/* MISSION STATEMENT */}
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="mx-auto h-1 w-16 bg-primary mb-6" />

        <h2 className="text-2xl sm:text-3xl font-semibold leading-relaxed">
          We partner with communities across the country to provide reliable
          transportation, create opportunities, and improve everyday travel
          experiences.
        </h2>
      </section>

      {/* IMAGE SECTION */}
      <section className="w-full overflow-hidden">
        <img
          src="/landing-assets/about-2.jpg"
          alt="Car on road"
          className="w-full max-h-[400px] object-cover"
        />
      </section>

      {/* ABOUT */}
      <section className="px-6 py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">
          About Us
        </h2>

        <div className="mx-auto h-1 w-16 bg-primary mt-3 mb-6" />

        <p className="text-muted-foreground leading-7">
          CarRental is built to simplify the way people rent vehicles. We focus
          on transparency, efficiency, and reliability so customers can spend
          less time worrying about logistics and more time enjoying their
          journey. Whether it’s a quick trip across town or a long-distance
          adventure, we provide vehicles that match your needs.
        </p>
      </section>

      {/* VALUES */}
      <section className="px-6 pb-16 max-w-5xl mx-auto grid gap-8 sm:grid-cols-3 text-center">
        <div>
          <h3 className="font-semibold text-lg">Innovation</h3>
          <p className="text-sm text-muted-foreground mt-2">
            We continuously improve our platform to make renting faster and easier.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Sustainability</h3>
          <p className="text-sm text-muted-foreground mt-2">
            We are moving toward eco-friendly vehicle options and cleaner travel.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">Customer First</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Every decision we make is focused on improving your experience.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16 text-center px-6">
        <h2 className="text-3xl font-bold">
          Ready to get started?
        </h2>

        <p className="mt-2">
          Browse vehicles and book your next ride today.
        </p>

        <a href="/browse">
          <button className="mt-4 px-6 py-3 bg-white text-black rounded-md font-medium">
            Browse Vehicles
          </button>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CarRental. All rights reserved.
      </footer>
    </main>
  );
}
