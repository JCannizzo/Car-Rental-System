import {
  AdminErrorState,
  AdminLoadingState,
  AdminShell,
  useAdminAccess,
} from "@/components/admin/admin-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  deleteVehicle,
  fetchVehicle,
  updateVehicle,
} from "@/lib/api";
import {
  VEHICLE_STATUSES,
  createVehicleFormState,
  createVehicleUpsertPayload,
  initialVehicleForm,
  type VehicleFormState,
} from "@/lib/vehicle-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";

export const Route = createFileRoute("/admin/inventory/$vehicleId")({
  component: EditVehiclePage,
});

function EditVehiclePage() {
  const { vehicleId } = Route.useParams();
  const { auth, isAdmin, isAllowed } = useAdminAccess(
    `/admin/inventory/${vehicleId}`,
  );
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const [vehicleForm, setVehicleForm] =
    useState<VehicleFormState>(initialVehicleForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: vehicle,
    error,
    isError,
    isLoading,
  } = useQuery({
    enabled: auth.isReady && auth.isAuthenticated && isAdmin,
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    retry: false,
  });

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    setVehicleForm(createVehicleFormState(vehicle));
  }, [vehicle]);

  const updateVehicleMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateVehicle>[1]) =>
      updateVehicle(vehicleId, payload),
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to update vehicle. Please check the details and try again.";

      setSuccessMessage("");
      setFormError(message);
    },
    onSuccess: async (updatedVehicle) => {
      setVehicleForm(createVehicleFormState(updatedVehicle));
      setFormError("");
      setSuccessMessage(
        `${updatedVehicle.year} ${updatedVehicle.make} ${updatedVehicle.model} was updated.`,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin-vehicle-inventory"],
        }),
      ]);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: () => deleteVehicle(vehicleId),
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to delete vehicle. Please try again.";

      setDeleteError(message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.removeQueries({ queryKey: ["vehicle", vehicleId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin-vehicle-inventory"],
        }),
      ]);
      void navigate({ to: "/admin/inventory" });
    },
  });

  const updateVehicleForm = (field: keyof VehicleFormState, value: string) => {
    setVehicleForm((currentForm) => ({ ...currentForm, [field]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleUpdateVehicle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = createVehicleUpsertPayload(vehicleForm);

    if (result.payload === null) {
      setSuccessMessage("");
      setFormError(result.error);
      return;
    }

    setFormError("");
    setSuccessMessage("");
    updateVehicleMutation.mutate(result.payload);
  };

  const expectedLicensePlate = vehicle?.licensePlate ?? "";
  const canDeleteVehicle =
    expectedLicensePlate.length > 0 &&
    deleteConfirmation.trim() === expectedLicensePlate &&
    !deleteVehicleMutation.isPending;

  const handleDeleteVehicle = () => {
    if (!vehicle) {
      return;
    }

    if (deleteConfirmation.trim() !== expectedLicensePlate) {
      setDeleteError("Type the vehicle license plate exactly to delete it.");
      return;
    }

    setDeleteError("");
    deleteVehicleMutation.mutate();
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);

    if (!open) {
      setDeleteConfirmation("");
      setDeleteError("");
    }
  };

  if (!isAllowed || isLoading) {
    return <AdminLoadingState />;
  }

  if (isError) {
    return <AdminErrorState error={error} title="Unable To Load Vehicle" />;
  }

  if (!vehicle) {
    return (
      <AdminErrorState
        error={new ApiError("Vehicle not found.", 404)}
        title="Vehicle Not Found"
      />
    );
  }

  return (
    <AdminShell title="Edit Vehicle">
      <section className="grid gap-5 p-4 lg:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline">
            <Link to="/admin/inventory">
              <ArrowLeft />
              Back to inventory
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link
              to="/vehicles/$vehicleId"
              params={{ vehicleId: vehicle.id }}
            >
              <ExternalLink />
              View listing
            </Link>
          </Button>
        </div>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </CardTitle>
            <CardDescription>
              Update inventory details, pricing, status, images, and features.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid gap-4" noValidate onSubmit={handleUpdateVehicle}>
              {successMessage ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
                  <CheckCircle2 />
                  <AlertTitle>Vehicle updated</AlertTitle>
                  <AlertDescription className="text-emerald-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              ) : null}

              {formError ? (
                <Alert variant="destructive">
                  <XCircle />
                  <AlertTitle>Vehicle could not be updated</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-3 md:grid-cols-3">
                <FormField label="Make" htmlFor="vehicle-make">
                  <Input
                    id="vehicle-make"
                    value={vehicleForm.make}
                    onChange={(event) =>
                      updateVehicleForm("make", event.target.value)
                    }
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

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={handleDeleteDialogOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 />
                      Delete vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete vehicle?</DialogTitle>
                      <DialogDescription>
                        This will permanently remove {vehicle.year}{" "}
                        {vehicle.make} {vehicle.model} from inventory.
                      </DialogDescription>
                    </DialogHeader>

                    {deleteError ? (
                      <Alert variant="destructive">
                        <XCircle />
                        <AlertTitle>Vehicle could not be deleted</AlertTitle>
                        <AlertDescription>{deleteError}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="grid gap-2">
                      <Label htmlFor="delete-confirmation">
                        Type {expectedLicensePlate} to confirm
                      </Label>
                      <Input
                        id="delete-confirmation"
                        autoComplete="off"
                        value={deleteConfirmation}
                        onChange={(event) => {
                          setDeleteConfirmation(event.target.value);
                          setDeleteError("");
                        }}
                      />
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={deleteVehicleMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={!canDeleteVehicle}
                        onClick={handleDeleteVehicle}
                      >
                        {deleteVehicleMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
                        {deleteVehicleMutation.isPending
                          ? "Deleting vehicle..."
                          : "Delete vehicle"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  type="submit"
                  disabled={updateVehicleMutation.isPending}
                >
                  {updateVehicleMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  {updateVehicleMutation.isPending
                    ? "Saving vehicle..."
                    : "Save changes"}
                </Button>
              </div>
            </form>
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
