import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRatings, type PublicRating } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Loader2, MessageSquare, Star } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { data, isError, isLoading } = useQuery({
    queryFn: fetchRatings,
    queryKey: ["ratings"],
  });

  const ratings = data ?? [];
  const average =
    ratings.length > 0
      ? ratings.reduce((total, rating) => total + rating.score, 0) / ratings.length
      : 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card px-5 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft />
            Back to home
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <Badge
                variant="outline"
                className="rounded-md border-primary/20 bg-transparent text-primary"
              >
                Testimonials
              </Badge>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Real reviews from completed rentals
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Feedback here comes from customer bookings that were completed
                before a review could be submitted.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-5">
              <p className="text-sm font-medium text-muted-foreground">
                Overall rating
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black">
                  {average > 0 ? average.toFixed(1) : "0.0"}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  / 5 from {ratings.length} review{ratings.length === 1 ? "" : "s"}
                </span>
              </div>
              <StarRating value={Math.round(average)} className="mt-3" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Unable to load testimonials</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Try refreshing the page.
              </CardContent>
            </Card>
          ) : ratings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No testimonials yet</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-muted-foreground">
                <p>
                  Completed customer reviews will appear here once they are
                  submitted.
                </p>
                <MessageSquare className="text-primary" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ratings.map((rating) => (
                <TestimonialCard key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function TestimonialCard({ rating }: { rating: PublicRating }) {
  return (
    <Card className="rounded-lg border-border bg-card py-0 shadow-sm">
      <CardHeader className="px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <StarRating value={rating.score} />
          <Badge variant="secondary" className="rounded-md">
            {rating.score}.0
          </Badge>
        </div>
        <CardTitle className="text-lg font-black">
          {rating.vehicleSummary || "CarRental customer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-5 pb-5">
        <blockquote className="min-h-20 text-base leading-7 text-card-foreground">
          {rating.comment?.trim()
            ? `"${rating.comment.trim()}"`
            : "No written comment was added for this rating."}
        </blockquote>
        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          {format(parseISO(rating.createdAt), "MMM d, yyyy")}
        </div>
      </CardContent>
    </Card>
  );
}

function StarRating({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 text-primary", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(index < value && "fill-current")}
        />
      ))}
    </div>
  );
}
