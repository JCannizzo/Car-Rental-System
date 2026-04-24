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
import {
  VEHICLE_CATEGORIES,
  type AdminVehicleSortBy,
  type SortDirection,
  type Vehicle,
  type VehicleCategory,
} from "@/lib/api";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Car, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useMemo } from "react";

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

interface InventoryDataTableProps {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  search: string;
  category: VehicleCategory | "all";
  status: string;
  sortBy: AdminVehicleSortBy;
  sortDirection: SortDirection;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: VehicleCategory | "all") => void;
  onStatusChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: AdminVehicleSortBy) => void;
}

function SortButton({
  label,
  sortKey,
  activeSort,
  direction,
  className,
  onSortChange,
}: {
  label: string;
  sortKey: AdminVehicleSortBy;
  activeSort: AdminVehicleSortBy;
  direction: SortDirection;
  className?: string;
  onSortChange: (sortBy: AdminVehicleSortBy) => void;
}) {
  const isActive = activeSort === sortKey;

  return (
    <Button
      className={className}
      variant="ghost"
      onClick={() => onSortChange(sortKey)}
    >
      {label}
      <ArrowUpDown
        className={
          isActive && direction === "desc"
            ? "h-3.5 w-3.5 rotate-180"
            : "h-3.5 w-3.5"
        }
      />
    </Button>
  );
}

function getColumns({
  onSortChange,
  sortBy,
  sortDirection,
}: Pick<
  InventoryDataTableProps,
  "onSortChange" | "sortBy" | "sortDirection"
>): ColumnDef<VehicleColumn>[] {
  return [
    {
      accessorKey: "vehicleLabel",
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Vehicle"
          sortKey="vehicle"
          onSortChange={onSortChange}
        />
      ),
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
    },
    {
      accessorKey: "category",
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Category"
          sortKey="category"
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "licensePlate",
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Plate"
          sortKey="plate"
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.getValue("licensePlate") || "Unassigned",
    },
    {
      accessorKey: "status",
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Status"
          sortKey="status"
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "mileage",
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Mileage"
          sortKey="mileage"
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <span>{numberFormatter.format(row.getValue("mileage"))} mi</span>
      ),
    },
    {
      accessorKey: "pricePerDay",
      header: () => (
        <div className="text-right">
          <SortButton
            activeSort={sortBy}
            className="-mr-2"
            direction={sortDirection}
            label="Daily rate"
            sortKey="rate"
            onSortChange={onSortChange}
          />
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
      header: () => (
        <SortButton
          activeSort={sortBy}
          className="-ml-2"
          direction={sortDirection}
          label="Specs"
          sortKey="specs"
          onSortChange={onSortChange}
        />
      ),
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
}

export function InventoryDataTable({
  vehicles,
  totalCount,
  page,
  pageSize,
  hasMore,
  search,
  category,
  status,
  sortBy,
  sortDirection,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPageChange,
  onSortChange,
}: InventoryDataTableProps) {
  const data = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        vehicleLabel: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      })),
    [vehicles],
  );
  const columns = useMemo(
    () => getColumns({ onSortChange, sortBy, sortDirection }),
    [onSortChange, sortBy, sortDirection],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search make, model, plate, status..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={status} onValueChange={onStatusChange}>
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
            value={category}
            onValueChange={(value) =>
              onCategoryChange(value as VehicleCategory | "all")
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
                  No vehicles match the current query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstItem}-{lastItem} of {totalCount} vehicles · Page {page}{" "}
          of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
