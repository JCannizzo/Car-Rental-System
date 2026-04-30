import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ApiError,
  createRating,
  fetchMyBookings,
  fetchMyRatings,
  type BookingDetails,
} from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isReady || auth.isAuthenticated) {
      return;
    }

    void auth.login(`${window.location.origin}/bookings`);
  }, [auth]);

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated,
    queryFn: fetchMyBookings,
    queryKey: ["my-bookings"],
    retry: false,
  });

  const { data: ratings, isLoading: isLoadingRatings } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated,
    queryFn: fetchMyRatings,
    queryKey: ["my-ratings"],
    retry: false,
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
    const status = error instanceof ApiError ? error.status : null;
    const message =
      status === 403
        ? "Your account is missing the customer role. Ask an admin to assign it, or re-register after the realm was re-imported."
        : status === 401
          ? "Your session expired. Try logging out and back in."
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Unable To Load Your Bookings</CardTitle>
            <CardDescription>
              {status !== null ? `(${status}) ` : ""}
              {message}
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
  const reviewedBookingIds = new Set((ratings ?? []).map((rating) => rating.bookingId));

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
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
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
                </div>
                <BookingReviewAction
                  booking={booking}
                  hasReview={reviewedBookingIds.has(booking.id)}
                  isCheckingReview={isLoadingRatings}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingReviewAction({
  booking,
  hasReview,
  isCheckingReview,
}: {
  booking: BookingDetails;
  hasReview: boolean;
  isCheckingReview: boolean;
}) {
  if (booking.status !== "Completed") {
    return null;
  }

  if (isCheckingReview) {
    return (
      <Button variant="outline" className="w-fit" disabled>
        <Loader2 data-icon="inline-start" className="animate-spin" />
        Checking review
      </Button>
    );
  }

  if (hasReview) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        <CheckCircle2 className="text-primary" />
        Reviewed
      </div>
    );
  }

  return <ReviewDialog booking={booking} />;
}

function ReviewDialog({ booking }: { booking: BookingDetails }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const commentLength = comment.trim().length;
  const mutation = useMutation({
    mutationFn: () =>
      createRating({
        bookingId: booking.id,
        score,
        comment: comment.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-ratings"] }),
        queryClient.invalidateQueries({ queryKey: ["ratings"] }),
      ]);
      setIsOpen(false);
      setScore(0);
      setComment("");
      setValidationError(null);
    },
  });

  const errorMessage = useMemo(() => {
    if (validationError) return validationError;
    if (mutation.error instanceof Error) return mutation.error.message;
    return null;
  }, [mutation.error, validationError]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.reset();

    if (score < 1) {
      setValidationError("Choose a rating before submitting.");
      return;
    }

    if (comment.length > 1000) {
      setValidationError("Keep your review under 1,000 characters.");
      return;
    }

    setValidationError(null);
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit">
          <Star data-icon="inline-start" />
          Leave review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate your rental</DialogTitle>
          <DialogDescription>
            Share a short note about your experience with {booking.vehicleSummary}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field data-invalid={score < 1 && Boolean(errorMessage)}>
              <FieldLabel>Rating</FieldLabel>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const isActive = value <= score;

                  return (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      className="rounded-md"
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      aria-pressed={isActive}
                      onClick={() => {
                        setScore(value);
                        setValidationError(null);
                      }}
                    >
                      <Star
                        className={cn(
                          "text-muted-foreground",
                          isActive && "fill-current text-primary",
                        )}
                      />
                    </Button>
                  );
                })}
              </div>
            </Field>

            <Field data-invalid={comment.length > 1000}>
              <FieldLabel htmlFor={`review-comment-${booking.id}`}>
                Comment
              </FieldLabel>
              <Textarea
                id={`review-comment-${booking.id}`}
                value={comment}
                maxLength={1000}
                aria-invalid={comment.length > 1000}
                placeholder="What went well?"
                onChange={(event) => setComment(event.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {commentLength}/1000 characters
              </p>
            </Field>

            {errorMessage && <FieldError>{errorMessage}</FieldError>}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
