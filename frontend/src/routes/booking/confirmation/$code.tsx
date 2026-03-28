import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchBookingByCode } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/booking/confirmation/$code")({
  component: BookingConfirmation,
});

function BookingConfirmation() {
  const { code } = Route.useParams();

  const {
    data: booking,
    isLoading,
    isError,
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

      <Button variant="outline" className="w-full mt-6" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
