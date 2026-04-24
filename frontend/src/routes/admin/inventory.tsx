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
import {
  fetchAdminVehicleInventory,
  type AdminVehicleSortBy,
  type SortDirection,
  type VehicleCategory,
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

const PAGE_SIZE = 15;

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const { auth, isAdmin, isAllowed } = useAdminAccess("/admin/inventory");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VehicleCategory | "all">("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<AdminVehicleSortBy>("vehicle");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: VehicleCategory | "all") => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (nextSortBy: AdminVehicleSortBy) => {
      setSortDirection((currentDirection) =>
        sortBy === nextSortBy && currentDirection === "asc" ? "desc" : "asc",
      );
      setSortBy(nextSortBy);
      setPage(1);
    },
    [sortBy],
  );

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminVehicleInventory({
        category,
        page,
        pageSize: PAGE_SIZE,
        search,
        sortBy,
        sortDirection,
        status,
      }),
    queryKey: [
      "admin-vehicle-inventory",
      page,
      PAGE_SIZE,
      search,
      category,
      status,
      sortBy,
      sortDirection,
    ],
    retry: false,
  });

  if (!isAllowed || isLoading) {
    return <AdminLoadingState />;
  }

  if (isError) {
    return <AdminErrorState error={error} title="Unable To Load Inventory" />;
  }

  const vehicles = data?.items ?? [];

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
                {data?.totalCount ?? 0} vehicles
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <InventoryDataTable
              category={category}
              hasMore={data?.hasMore ?? false}
              page={page}
              pageSize={PAGE_SIZE}
              search={search}
              sortBy={sortBy}
              sortDirection={sortDirection}
              status={status}
              totalCount={data?.totalCount ?? 0}
              vehicles={vehicles}
              onCategoryChange={handleCategoryChange}
              onPageChange={setPage}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
