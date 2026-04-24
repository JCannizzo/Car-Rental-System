import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import { InventoryDataTable } from "@/components/admin/inventory-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAdminVehicles } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const { auth, isAdmin, isAllowed } = useAdminAccess("/admin/inventory");

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: fetchAdminVehicles,
    queryKey: ["admin-vehicles"],
    retry: false,
  });

  if (!isAllowed || isLoading) {
    return <AdminLoadingState />;
  }

  if (isError) {
    return <AdminErrorState error={error} title="Unable To Load Inventory" />;
  }

  const vehicles = data ?? [];

  return (
    <AdminShell title="Inventory">
      <section className="grid gap-5 p-4 lg:p-7">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Fleet Inventory</CardTitle>
                <CardDescription>
                  Search, sort, and filter vehicles across the rental fleet.
                </CardDescription>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {vehicles.length} vehicles
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <InventoryDataTable vehicles={vehicles} />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
