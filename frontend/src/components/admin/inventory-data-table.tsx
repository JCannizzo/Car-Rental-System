import { StatusBadge } from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VEHICLE_CATEGORIES, type Vehicle } from "@/lib/api";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_FILTERS = ["Available", "Rented", "Maintenance", "Retired"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("en-US");

type VehicleColumn = Vehicle & {
  vehicleLabel: string;
};

function sortableHeader(label: string) {
  return ({ column }: { column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void } }) => (
    <Button
      className="-ml-2"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  );
}

const columns: ColumnDef<VehicleColumn>[] = [
  {
    accessorKey: "vehicleLabel",
    header: sortableHeader("Vehicle"),
    cell: ({ row }) => {
      const vehicle = row.original;
      const imageUrl = vehicle.imageUrlFront || vehicle.imageUrl;

      return (
        <div className="flex min-w-[240px] items-center gap-3">
          {imageUrl ? (
            <img
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="h-12 w-16 rounded-md border object-cover"
              src={imageUrl}
            />
          ) : (
            <div className="grid h-12 w-16 place-items-center rounded-md border bg-muted">
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-xs text-muted-foreground">
              {vehicle.year} · {vehicle.seats} seats · {vehicle.doors} doors
            </p>
          </div>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase().trim();

      if (!query) {
        return true;
      }

      const vehicle = row.original;
      return [
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.category,
        vehicle.licensePlate,
        vehicle.status,
        vehicle.transmission,
        vehicle.fuelType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
    filterFn: (row, columnId, filterValue) =>
      filterValue === "all" || row.getValue(columnId) === filterValue,
  },
  {
    accessorKey: "licensePlate",
    header: "Plate",
    cell: ({ row }) => row.getValue("licensePlate") || "Unassigned",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, columnId, filterValue) =>
      filterValue === "all" ||
      String(row.getValue(columnId)).toLowerCase() ===
        String(filterValue).toLowerCase(),
  },
  {
    accessorKey: "mileage",
    header: sortableHeader("Mileage"),
    cell: ({ row }) => (
      <span>{numberFormatter.format(row.getValue("mileage"))} mi</span>
    ),
  },
  {
    accessorKey: "pricePerDay",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          className="-mr-2"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Daily rate
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {currencyFormatter.format(row.getValue("pricePerDay"))}
      </div>
    ),
  },
  {
    id: "specs",
    header: "Specs",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.transmission} · {row.original.fuelType}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          aria-label={`View ${row.original.make} ${row.original.model}`}
          size="icon-sm"
          variant="ghost"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function InventoryDataTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const data = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        vehicleLabel: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      })),
    [vehicles],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting,
    },
  });

  const vehicleSearch =
    (table.getColumn("vehicleLabel")?.getFilterValue() as string) ?? "";
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";
  const categoryFilter =
    (table.getColumn("category")?.getFilterValue() as string) ?? "all";

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search make, model, plate, status..."
            value={vehicleSearch}
            onChange={(event) =>
              table
                .getColumn("vehicleLabel")
                ?.setFilterValue(event.target.value)
            }
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              table.getColumn("category")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {VEHICLE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-28 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  No vehicles match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} filtered vehicles
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
