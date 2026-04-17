import { Button } from "@/components/ui/button";
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Car } from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="font-semibold text-lg">Car Rental</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/browse">
                <Button variant="ghost" size="sm">Browse</Button>
              </Link>    
              <Link to="/auth" search={{ tab: "login" }}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth" search={{ tab: "register" }}>
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </div>
  ),
});
