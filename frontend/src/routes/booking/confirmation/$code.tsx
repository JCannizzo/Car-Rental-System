import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchBookingByCode } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";

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
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold">Booking Confirmed</h1>
        <p className="text-muted-foreground mt-1">
          Your reservation has been created
        </p>
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
              <span className="font-medium text-right">{item.value}</span>
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
