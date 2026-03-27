import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        {/* SCRUM-71: Login Page */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your rental account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-brand-primary">Login</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SCRUM-72: Register Page */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">Create Account</CardTitle>
              <CardDescription>Join our fleet and start your journey today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-brand-primary">Create Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}