import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPendingBookingClaimCode } from "@/lib/booking-claim";
import { useAuth } from "@/lib/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRouteApi } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const authRoute = getRouteApi("/auth");

export default function AuthPage() {
  const auth = useAuth();
  const navigate = authRoute.useNavigate();
  const search = authRoute.useSearch();
  const [activeTab, setActiveTab] = useState(search.mode ?? "login");
  const pendingClaimCode = getPendingBookingClaimCode();

  useEffect(() => {
    setActiveTab(search.mode ?? "login");
  }, [search.mode]);

  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated || pendingClaimCode) {
      return;
    }

    window.location.replace(search.redirect ?? "/bookings");
  }, [auth.isAuthenticated, auth.isReady, pendingClaimCode, search.redirect]);

  const handleTabChange = (value: string) => {
    const nextTab = value === "register" ? "register" : "login";
    setActiveTab(nextTab);
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        mode: nextTab,
      }),
    });
  };

  const handleLogin = () => {
    void auth.login(window.location.href);
  };

  const handleRegister = () => {
    void auth.register(window.location.href);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">Welcome Back</CardTitle>
              <CardDescription>
                Continue to the secure Keycloak login flow to access your rental account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingClaimCode ? (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="font-medium">Booking ready to claim</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign in with the same email used during checkout to attach booking{" "}
                    <span className="font-medium text-foreground">
                      {pendingClaimCode}
                    </span>{" "}
                    to your account.
                  </p>
                </div>
              ) : null}
              {auth.isReady && auth.isAuthenticated ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to your account...
                </div>
              ) : null}
              {auth.error ? (
                <p className="text-sm text-destructive">{auth.error}</p>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-brand-primary" onClick={handleLogin} disabled={!auth.isReady}>
                Continue To Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">Create Account</CardTitle>
              <CardDescription>
                Create your account in Keycloak, then we&apos;ll bring you back here automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="font-medium">Use the checkout email address</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you&apos;re claiming a paid guest booking, register with the same email you used during Stripe checkout.
                </p>
              </div>
              {auth.error ? (
                <p className="text-sm text-destructive">{auth.error}</p>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-brand-primary" onClick={handleRegister} disabled={!auth.isReady}>
                Create Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
