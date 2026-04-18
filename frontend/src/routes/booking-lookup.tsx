import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingLookup() {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Booking not found");
      const data = await res.json();
      setBooking(data);
    } catch (err: any) {
      setBooking(null);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Find Your Reservation</h1>
      <div className="flex gap-2 mb-6">
        <Input 
          placeholder="Enter Booking ID" 
          value={bookingId} 
          onChange={(e) => setBookingId(e.target.value)} 
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {booking && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>{booking.vehicleName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
            <p><strong>Check-in:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
            <hr className="my-2" />
            <p className="text-2xl font-bold text-green-600">${booking.totalPrice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}