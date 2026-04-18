import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  clearPendingBookingClaimCode,
  consumeBookingClaimError,
  getPendingBookingClaimCode,
  mapClaimErrorMessage,
  setPendingBookingClaimCode,
} from "@/lib/booking-claim";
import { claimBooking, fetchBookingByCode } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/booking/confirmation/$code")({
  component: BookingConfirmation,
});

function BookingConfirmation() {
  const { code } = Route.useParams();
  const auth = useAuth();
  const navigate = Route.useNavigate();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const autoClaimAttemptedRef = useRef(false);

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["booking", code],
    queryFn: () => fetchBookingByCode(code),
    // Poll every 2s while payment is still pending
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.paymentStatus !== "Paid") return 2000;
      return false;
    },
  });

  useEffect(() => {
    setClaimError(consumeBookingClaimError(code));
  }, [code]);

  const isOwnedByCurrentUser = Boolean(
    auth.user?.id && booking?.userId === auth.user.id,
  );

  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated) return;
    if (!booking) return;
    if (getPendingBookingClaimCode() !== booking.confirmationCode) return;
    if (isOwnedByCurrentUser) {
      clearPendingBookingClaimCode();
      void navigate({ to: "/bookings" });
      return;
    }
    if (booking.paymentStatus !== "Paid") return;
    if (booking.userId) return;
    if (autoClaimAttemptedRef.current || isClaiming) return;

    autoClaimAttemptedRef.current = true;
    setIsClaiming(true);
    setClaimError(null);
    claimBooking(booking.confirmationCode)
      .then(() => {
        clearPendingBookingClaimCode();
        void navigate({ to: "/bookings" });
      })
      .catch((error: unknown) => {
        setClaimError(mapClaimErrorMessage(error));
      })
      .finally(() => {
        setIsClaiming(false);
        void refetch();
      });
  }, [
    auth.isReady,
    auth.isAuthenticated,
    booking,
    isClaiming,
    isOwnedByCurrentUser,
    navigate,
    refetch,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-lg font-medium">Booking not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          We couldn't find a booking with that confirmation code.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === "Paid";
  const isClaimed = Boolean(booking.userId);

  const details = [
    { label: "Vehicle", value: booking.vehicleSummary },
    {
      label: "Pick-up",
      value: format(parseISO(booking.startDate), "EEEE, MMMM d, yyyy"),
    },
    {
      label: "Return",
      value: format(parseISO(booking.endDate), "EEEE, MMMM d, yyyy"),
    },
    { label: "Total", value: `$${booking.totalPrice}` },
    { label: "Status", value: booking.status },
    { label: "Payment", value: booking.paymentStatus },
  ];

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimError(null);

    try {
      await claimBooking(booking.confirmationCode);
      clearPendingBookingClaimCode();
      void navigate({ to: "/bookings" });
    } catch (error) {
      setClaimError(mapClaimErrorMessage(error));
    } finally {
      setIsClaiming(false);
      void refetch();
    }
  };

  const handleAuthRedirect = (mode: "login" | "register") => {
    setPendingBookingClaimCode(booking.confirmationCode);
    if (mode === "register") {
      void auth.register(window.location.href, {
        bookingConfirmationCode: booking.confirmationCode,
        bookingEmail: booking.guestEmail ?? undefined,
      });
      return;
    }

    void auth.login(window.location.href);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        {isPaid ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold">Booking Confirmed</h1>
            <p className="text-muted-foreground mt-1">
              Your reservation is all set
            </p>
          </>
        ) : (
          <>
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold">Confirming Payment</h1>
            <p className="text-muted-foreground mt-1">
              Waiting for payment confirmation from Stripe...
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Confirmation Code
          </p>
          <p className="text-2xl font-bold tracking-wide mt-1">
            {booking.confirmationCode}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          {details.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-right flex items-center gap-2">
                {item.label === "Payment" && !isPaid && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {item.label === "Payment" ? (
                  <Badge
                    variant={isPaid ? "default" : "secondary"}
                    className={isPaid ? "bg-green-600" : ""}
                  >
                    {item.value}
                  </Badge>
                ) : item.label === "Status" ? (
                  <Badge variant="outline">{item.value}</Badge>
                ) : (
                  item.value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {claimError ? (
        <Alert variant="destructive" className="mt-4 border-destructive/40 bg-destructive/5">
          <AlertCircle />
          <AlertTitle>We couldn&apos;t link this booking</AlertTitle>
          <AlertDescription>{claimError}</AlertDescription>
        </Alert>
      ) : null}

      {isPaid ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {isOwnedByCurrentUser
                ? "Saved To Your Account"
                : "Save This Booking"}
            </CardTitle>
            <CardDescription>
              {isOwnedByCurrentUser
                ? "This paid booking is already attached to your customer account."
                : isClaimed
                  ? "This booking is already linked to an account."
                  : "Use the same email address from checkout to attach this booking to your customer profile."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOwnedByCurrentUser ? (
              <Button className="w-full" asChild>
                <Link to="/bookings">Go To My Bookings</Link>
              </Button>
            ) : auth.isReady && auth.isAuthenticated ? (
              <Button
                className="w-full"
                disabled={isClaiming || isClaimed}
                onClick={() => void handleClaim()}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Booking
                  </>
                ) : (
                  "Save To My Account"
                )}
              </Button>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => handleAuthRedirect("register")}>
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuthRedirect("login")}
                >
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Button variant="outline" className="w-full mt-6" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
