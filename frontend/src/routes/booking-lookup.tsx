import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface BookingData {
  vehicleName: string;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export default function BookingLookup() {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!bookingId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Booking not found. Please check your ID.");
      const data = await res.json();
      setBooking(data);
    } catch (err: unknown) {
      setBooking(null);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Manage Your Booking</h1>
        <p className="text-muted-foreground mt-2">Enter your reference number to view reservation details.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="e.g. 12345" 
            className="pl-9"
            value={bookingId} 
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Find Reservation"}
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {booking && (
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xl">{booking.vehicleName}</CardTitle>
            <p className="text-sm font-medium text-primary uppercase tracking-wide">
              Status: {booking.status}
            </p>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pick-up</p>
                <p className="font-semibold">{new Date(booking.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return</p>
                <p className="font-semibold">{new Date(booking.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-medium">Total Price</span>
              <span className="text-3xl font-bold text-green-700">${booking.totalPrice}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}