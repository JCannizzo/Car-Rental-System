import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMyBookings } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isReady || auth.isAuthenticated) {
      return;
    }

    void navigate({
      search: {
        mode: "login",
        redirect: "/bookings",
      },
      to: "/auth",
    });
  }, [auth.isAuthenticated, auth.isReady, navigate]);

  const { data, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated,
    queryFn: fetchMyBookings,
    queryKey: ["my-bookings"],
  });

  if (!auth.isReady || (auth.isAuthenticated && isLoading)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Unable To Load Your Bookings</CardTitle>
            <CardDescription>
              Try refreshing the page or signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookings = data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          View the reservations attached to your customer account.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No bookings yet</CardTitle>
            <CardDescription>
              You don&apos;t have any bookings yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Browse vehicles</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{booking.vehicleSummary}</CardTitle>
                    <CardDescription className="mt-1">
                      Confirmation Code: {booking.confirmationCode}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{booking.status}</Badge>
                    <Badge
                      className={booking.paymentStatus === "Paid" ? "bg-green-600" : ""}
                      variant={booking.paymentStatus === "Paid" ? "default" : "secondary"}
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div>
                  <p className="font-medium text-foreground">Pick-up</p>
                  <p>{format(parseISO(booking.startDate), "EEEE, MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Return</p>
                  <p>{format(parseISO(booking.endDate), "EEEE, MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Total</p>
                  <p>${booking.totalPrice}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
