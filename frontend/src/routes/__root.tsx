import { Button } from "@/components/ui/button";
import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useAuth } from "@/lib/use-auth";
import { Car } from "lucide-react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const auth = useAuth();
  const location = useLocation();
  const isStaff = auth.user?.roles.some((role) =>
    ["admin", "employee"].includes(role.toLowerCase()),
  );
  const isAdminRoute =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  return (
    <div className="min-h-screen bg-background">
      {!isAdminRoute ? (
        <header className="sticky top-0 z-50 border-b border-[#dfded8] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3 text-[#141a1f]">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#105645] text-white">
                  <Car />
                </span>
                <span className="text-xl font-black tracking-normal">CarRental</span>
              </Link>
              <nav className="hidden items-center gap-8 text-base font-semibold text-[#141a1f] md:flex">
                <Link to="/browse" className="hover:text-[#105645]">
                  Browse
                </Link>
                <Link
                  to="/"
                  hash="testimonials"
                  className="hover:text-[#105645]"
                >
                  Testimonials
                </Link>
                <Link to="/about" className="hover:text-[#105645]">
                  Help
                </Link>
              </nav>
              <div className="flex items-center gap-3">
                {auth.isReady && auth.isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-11 rounded-md px-4 text-base"
                    >
                      {isStaff ? (
                        <Link to="/admin">Admin</Link>
                      ) : (
                        <Link to="/bookings">My Bookings</Link>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 rounded-md px-4 text-base"
                      onClick={() => void auth.logout()}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="h-11 rounded-md px-4 text-base"
                      disabled={!auth.isReady}
                      onClick={() => void auth.login(window.location.href)}
                    >
                      Log in
                    </Button>
                    <Button
                      className="h-11 rounded-md bg-[#105645] px-4 text-base text-white hover:bg-[#174f43]"
                      disabled={!auth.isReady}
                      onClick={() => void auth.register(window.location.href)}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
            {auth.error ? (
              <p className="mt-3 text-sm text-destructive">{auth.error}</p>
            ) : null}
          </div>
        </header>
      ) : null}
      <Outlet />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </div>
  );
}
