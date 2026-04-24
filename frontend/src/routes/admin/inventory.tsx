import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import { InventoryDataTable } from "@/components/admin/inventory-data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApiError,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_CATEGORIES,
  createVehicle,
  fetchAdminVehicleInventory,
  type AdminVehicleSortBy,
  type SortDirection,
  type VehicleCategory,
  type VehicleUpsertRequest,
} from "@/lib/api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, PlusCircle, XCircle } from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 350;
const VEHICLE_STATUSES = ["Available", "Rented", "Maintenance", "Retired"];

interface VehicleFormState {
  make: string;
  model: string;
  year: string;
  category: VehicleCategory;
  transmission: string;
  fuelType: string;
  seats: string;
  doors: string;
  pricePerDay: string;
  mileage: string;
  features: string;
  imageUrl: string;
  imageUrlFront: string;
  licensePlate: string;
  status: string;
}

const initialVehicleForm: VehicleFormState = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  category: "Sedan",
  transmission: "Automatic",
  fuelType: "Gasoline",
  seats: "5",
  doors: "4",
  pricePerDay: "",
  mileage: "0",
  features: "",
  imageUrl: "",
  imageUrlFront: "",
  licensePlate: "",
  status: "Available",
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const { auth, isAdmin, isAllowed } = useAdminAccess("/admin/inventory");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VehicleCategory | "all">("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<AdminVehicleSortBy>("vehicle");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleForm, setVehicleForm] =
    useState<VehicleFormState>(initialVehicleForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const updateVehicleForm = useCallback(
    (field: keyof VehicleFormState, value: string) => {
      setVehicleForm((currentForm) => ({ ...currentForm, [field]: value }));
      setFormError("");
      setSuccessMessage("");
    },
    [],
  );

  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to add vehicle. Please check the details and try again.";

      setSuccessMessage("");
      setFormError(message);
    },
    onSuccess: async (vehicle) => {
      setVehicleForm(initialVehicleForm);
      setFormError("");
      setSuccessMessage(
        `${vehicle.year} ${vehicle.make} ${vehicle.model} was added to inventory.`,
      );
      setPage(1);
      setSearch("");
      setCategory("all");
      setStatus("all");
      setSortBy("vehicle");
      setSortDirection("asc");
      setIsAddVehicleOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["admin-vehicle-inventory"],
      });
    },
  });

  const handleAddVehicle = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const make = vehicleForm.make.trim();
      const model = vehicleForm.model.trim();
      const licensePlate = vehicleForm.licensePlate.trim();
      const year = Number(vehicleForm.year);
      const seats = Number(vehicleForm.seats);
      const doors = Number(vehicleForm.doors);
      const pricePerDay = Number(vehicleForm.pricePerDay);
      const mileage = Number(vehicleForm.mileage);

      if (!make || !model || !licensePlate) {
        setSuccessMessage("");
        setFormError("Make, model, and license plate are required.");
        return;
      }

      if (!Number.isInteger(year) || year < 1900 || year > 3000) {
        setSuccessMessage("");
        setFormError("Year must be a whole number between 1900 and 3000.");
        return;
      }

      if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
        setSuccessMessage("");
        setFormError("Seats must be a whole number between 1 and 20.");
        return;
      }

      if (!Number.isInteger(doors) || doors < 1 || doors > 10) {
        setSuccessMessage("");
        setFormError("Doors must be a whole number between 1 and 10.");
        return;
      }

      if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
        setSuccessMessage("");
        setFormError("Daily rate must be greater than 0.");
        return;
      }

      if (!Number.isInteger(mileage) || mileage < 0) {
        setSuccessMessage("");
        setFormError("Mileage must be a whole number of 0 or more.");
        return;
      }

      const payload: VehicleUpsertRequest = {
        make,
        model,
        year,
        category: vehicleForm.category,
        transmission: vehicleForm.transmission,
        fuelType: vehicleForm.fuelType,
        seats,
        doors,
        pricePerDay,
        mileage,
        features: vehicleForm.features
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean),
        imageUrl: vehicleForm.imageUrl.trim(),
        imageUrlFront: vehicleForm.imageUrlFront.trim(),
        licensePlate,
        status: vehicleForm.status,
      };

      setFormError("");
      setSuccessMessage("");
      createVehicleMutation.mutate(payload);
    },
    [createVehicleMutation, vehicleForm],
  );

  const { data, error, isError, isLoading } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryFn: () =>
      fetchAdminVehicleInventory({
        category,
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        sortBy,
        sortDirection,
        status,
      }),
    queryKey: [
      "admin-vehicle-inventory",
      page,
      PAGE_SIZE,
      debouncedSearch,
      category,
      status,
      sortBy,
      sortDirection,
    ],
    placeholderData: keepPreviousData,
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
        <Card className="rounded-lg shadow-sm" size="sm">
          <CardHeader className={isAddVehicleOpen ? "border-b" : undefined}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Add Vehicle</CardTitle>
                <CardDescription>
                  Create a new fleet record for the admin inventory.
                </CardDescription>
              </div>
              <Button
                aria-expanded={isAddVehicleOpen}
                aria-controls="add-vehicle-panel"
                className="mt-2 w-full sm:mt-0 sm:w-auto"
                type="button"
                variant={isAddVehicleOpen ? "outline" : "default"}
                onClick={() =>
                  setIsAddVehicleOpen((currentOpen) => !currentOpen)
                }
              >
                {isAddVehicleOpen ? (
                  <>
                    <ChevronDown className="rotate-180" />
                    Hide form
                  </>
                ) : (
                  <>
                    <PlusCircle />
                    Add vehicle
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isAddVehicleOpen || successMessage || formError ? (
            <CardContent
              className={isAddVehicleOpen ? "pt-4" : "pt-0"}
              id="add-vehicle-panel"
            >
              <div className="grid gap-4">
              {successMessage ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
                  <CheckCircle2 />
                  <AlertTitle>Vehicle added</AlertTitle>
                  <AlertDescription className="text-emerald-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              ) : null}

              {formError ? (
                <Alert variant="destructive">
                  <XCircle />
                  <AlertTitle>Vehicle could not be added</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              {isAddVehicleOpen ? (
                <form className="grid gap-4" noValidate onSubmit={handleAddVehicle}>
              <div className="grid gap-3 md:grid-cols-3">
                <FormField label="Make" htmlFor="vehicle-make">
                  <Input
                    id="vehicle-make"
                    value={vehicleForm.make}
                    onChange={(event) =>
                      updateVehicleForm("make", event.target.value)
                    }
                    placeholder="Toyota"
                    required
                  />
                </FormField>

                <FormField label="Model" htmlFor="vehicle-model">
                  <Input
                    id="vehicle-model"
                    value={vehicleForm.model}
                    onChange={(event) =>
                      updateVehicleForm("model", event.target.value)
                    }
                    placeholder="Camry"
                    required
                  />
                </FormField>

                <FormField label="Year" htmlFor="vehicle-year">
                  <Input
                    id="vehicle-year"
                    type="number"
                    min={1900}
                    max={3000}
                    value={vehicleForm.year}
                    onChange={(event) =>
                      updateVehicleForm("year", event.target.value)
                    }
                    required
                  />
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <FormField label="Category" htmlFor="vehicle-category">
                  <Select
                    value={vehicleForm.category}
                    onValueChange={(value) =>
                      updateVehicleForm("category", value)
                    }
                  >
                    <SelectTrigger id="vehicle-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_CATEGORIES.map((categoryOption) => (
                        <SelectItem key={categoryOption} value={categoryOption}>
                          {categoryOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Status" htmlFor="vehicle-status">
                  <Select
                    value={vehicleForm.status}
                    onValueChange={(value) => updateVehicleForm("status", value)}
                  >
                    <SelectTrigger id="vehicle-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_STATUSES.map((statusOption) => (
                        <SelectItem key={statusOption} value={statusOption}>
                          {statusOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Transmission" htmlFor="vehicle-transmission">
                  <Select
                    value={vehicleForm.transmission}
                    onValueChange={(value) =>
                      updateVehicleForm("transmission", value)
                    }
                  >
                    <SelectTrigger id="vehicle-transmission" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSMISSION_TYPES.map((transmissionOption) => (
                        <SelectItem
                          key={transmissionOption}
                          value={transmissionOption}
                        >
                          {transmissionOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Fuel type" htmlFor="vehicle-fuel">
                  <Select
                    value={vehicleForm.fuelType}
                    onValueChange={(value) =>
                      updateVehicleForm("fuelType", value)
                    }
                  >
                    <SelectTrigger id="vehicle-fuel" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((fuelOption) => (
                        <SelectItem key={fuelOption} value={fuelOption}>
                          {fuelOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <FormField label="Seats" htmlFor="vehicle-seats">
                  <Input
                    id="vehicle-seats"
                    type="number"
                    min={1}
                    max={20}
                    value={vehicleForm.seats}
                    onChange={(event) =>
                      updateVehicleForm("seats", event.target.value)
                    }
                    required
                  />
                </FormField>

                <FormField label="Doors" htmlFor="vehicle-doors">
                  <Input
                    id="vehicle-doors"
                    type="number"
                    min={1}
                    max={10}
                    value={vehicleForm.doors}
                    onChange={(event) =>
                      updateVehicleForm("doors", event.target.value)
                    }
                    required
                  />
                </FormField>

                <FormField label="Daily rate" htmlFor="vehicle-rate">
                  <Input
                    id="vehicle-rate"
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={vehicleForm.pricePerDay}
                    onChange={(event) =>
                      updateVehicleForm("pricePerDay", event.target.value)
                    }
                    placeholder="89"
                    required
                  />
                </FormField>

                <FormField label="Mileage" htmlFor="vehicle-mileage">
                  <Input
                    id="vehicle-mileage"
                    type="number"
                    min={0}
                    value={vehicleForm.mileage}
                    onChange={(event) =>
                      updateVehicleForm("mileage", event.target.value)
                    }
                    required
                  />
                </FormField>

                <FormField label="License plate" htmlFor="vehicle-plate">
                  <Input
                    id="vehicle-plate"
                    value={vehicleForm.licensePlate}
                    onChange={(event) =>
                      updateVehicleForm("licensePlate", event.target.value)
                    }
                    placeholder="SED-009"
                    required
                  />
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <FormField label="Image URL" htmlFor="vehicle-image">
                  <Input
                    id="vehicle-image"
                    value={vehicleForm.imageUrl}
                    onChange={(event) =>
                      updateVehicleForm("imageUrl", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </FormField>

                <FormField label="Front image URL" htmlFor="vehicle-front-image">
                  <Input
                    id="vehicle-front-image"
                    value={vehicleForm.imageUrlFront}
                    onChange={(event) =>
                      updateVehicleForm("imageUrlFront", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </FormField>

                <FormField label="Features" htmlFor="vehicle-features">
                  <Input
                    id="vehicle-features"
                    value={vehicleForm.features}
                    onChange={(event) =>
                      updateVehicleForm("features", event.target.value)
                    }
                    placeholder="Backup camera, Bluetooth"
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createVehicleMutation.isPending}
                >
                  <PlusCircle />
                  {createVehicleMutation.isPending
                    ? "Adding vehicle..."
                    : "Add vehicle"}
                </Button>
              </div>
                </form>
              ) : null}
              </div>
            </CardContent>
          ) : null}
        </Card>

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

function FormField({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
