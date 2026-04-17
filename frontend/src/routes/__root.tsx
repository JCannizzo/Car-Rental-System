import { Button } from "@/components/ui/button";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useAuth } from "@/lib/use-auth";
import { Car } from "lucide-react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="font-semibold text-lg">Car Rental</span>
            </Link>
            <div className="flex items-center gap-3">
              {auth.isReady && auth.isAuthenticated ? (
                <>
                  <Link to="/bookings">
                    <Button variant="ghost" size="sm">
                      My Bookings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void auth.logout()}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!auth.isReady}
                    onClick={() => void auth.login(window.location.href)}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
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
      <Outlet />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </div>
  );
}
