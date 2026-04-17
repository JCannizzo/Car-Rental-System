import { Button } from "@/components/ui/button";
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  claimBooking,
  ApiError,
} from "@/lib/api";
import {
  clearPendingBookingClaimCode,
  getPendingBookingClaimCode,
  isTerminalClaimError,
  mapClaimErrorMessage,
  setBookingClaimError,
} from "@/lib/booking-claim";
import { useAuth } from "@/lib/use-auth";
import { Car, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <PendingBookingClaimSync />
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
                  <Link to="/auth" search={{ mode: "login" }}>
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/auth" search={{ mode: "register" }}>
                    <Button size="sm">Sign up</Button>
                  </Link>
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

function PendingBookingClaimSync() {
  const auth = useAuth();
  const navigate = useNavigate();
  const inFlightCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated) {
      return;
    }

    const code = getPendingBookingClaimCode();
    if (!code || inFlightCodeRef.current === code) {
      return;
    }

    inFlightCodeRef.current = code;

    void claimBooking(code)
      .then(() => {
        clearPendingBookingClaimCode();
        inFlightCodeRef.current = null;
        void navigate({ to: "/bookings" });
      })
      .catch((error: unknown) => {
        if (isTerminalClaimError(error)) {
          clearPendingBookingClaimCode();
          setBookingClaimError(code, mapClaimErrorMessage(error));
          inFlightCodeRef.current = null;
          void navigate({
            params: { code },
            replace: true,
            to: "/booking/confirmation/$code",
          });
          return;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "We couldn't attach this booking right now.";
        setBookingClaimError(code, message);
      });
  }, [auth.isAuthenticated, auth.isReady, navigate]);

  if (!auth.isReady || !auth.isAuthenticated || !getPendingBookingClaimCode()) {
    return null;
  }

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Saving your paid booking to this account...
      </div>
    </div>
  );
}
