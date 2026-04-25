import { Link } from "react-router-dom";
import { Search, Car, Home } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-card">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        {/* Logo / Brand */}
        <Link to="/" className="font-bold text-xl mr-8">
          CarRental
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="w-4 h-4" /> Home
          </Link>
          
          <Link to="/vehicles" className="flex items-center gap-1 hover:text-primary">
            <Car className="w-4 h-4" /> Browse Cars
          </Link>

          {/* THIS IS THE SCRUM-73 LINK */}
          <Link 
            to="/booking-lookup" 
            className="flex items-center gap-1 text-primary font-bold hover:opacity-80"
          >
            <Search className="w-4 h-4" /> Find Booking
          </Link>
        </div>
      </div>
    </nav>
  );
}
