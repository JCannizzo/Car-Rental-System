import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  Download,
  Loader2,
  LogOut,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
] as const;

export function hasAdminRole(roles: string[] = []) {
  return roles.some((role) => role.toLowerCase() === "admin");
}

export function useAdminAccess(redirectPath: string) {
  const auth = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasAdminRole(auth.user?.roles);

  useEffect(() => {
    if (!auth.isReady) {
      return;
    }

    if (!auth.isAuthenticated) {
      void auth.login(`${window.location.origin}${redirectPath}`);
      return;
    }

    if (!isAdmin) {
      void navigate({ to: "/" });
    }
  }, [auth, isAdmin, navigate, redirectPath]);

  return {
    auth,
    isAdmin,
    isAllowed: auth.isReady && auth.isAuthenticated && isAdmin,
  };
}

export function AdminLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AdminErrorState({
  error,
  title = "Unable To Load Admin Dashboard",
}: {
  error: unknown;
  title?: string;
}) {
  const status = error instanceof ApiError ? error.status : null;
  const message =
    status === 403
      ? "Your account is missing the admin role."
      : status === 401
        ? "Your session expired. Try logging out and back in."
        : error instanceof Error
          ? error.message
          : "Something went wrong.";

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
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
    </AdminShell>
  );
}

export function AdminShell({
  children,
  title = "Rental operations",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r bg-background lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b px-5 py-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Car Rental</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Admin operations
              </p>
            </div>
          </div>

          <AdminNav className="flex-1 p-4" />

          <div className="border-t p-4">
            <div className="mb-3 rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-semibold">Admin Console</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fleet management
              </p>
            </div>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => void auth.logout(window.location.origin)}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b bg-muted/80 px-4 py-4 backdrop-blur lg:px-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin dashboard
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal">
                  {title}
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AdminNav className="flex gap-2 overflow-x-auto lg:hidden" compact />
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download />
                    Export
                  </Button>
                  <Button>
                    <Plus />
                    Add vehicle
                  </Button>
                  <Button
                    className="lg:hidden"
                    variant="outline"
                    onClick={() => void auth.logout(window.location.origin)}
                  >
                    <LogOut />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNav({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Admin">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.href);
        const className = cn(
          "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          isActive &&
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          compact && "h-9 shrink-0 border bg-background",
        );

        if (item.href === "/admin" || item.href === "/admin/inventory") {
          return (
            <Link key={item.href} to={item.href} className={className}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        }

        return (
          <a key={item.href} href={item.href} className={className}>
            <Icon className="h-4 w-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toLowerCase();
  const className =
    normalized === "available"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "rented"
        ? "bg-sky-50 text-sky-700"
        : normalized === "maintenance"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return (
    <Badge className={className} variant="secondary">
      {status || "Unknown"}
    </Badge>
  );
}
