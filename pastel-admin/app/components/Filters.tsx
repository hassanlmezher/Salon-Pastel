import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { type AdminAppointmentFilters } from "../../src/features/admin/types";

const statusOptions = [
  { value: "booked", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function Filters({ filters }: { filters: AdminAppointmentFilters }) {
  return (
    <form className="filters" action="/">
      <label>
        <span>Date</span>
        <input name="date" type="date" defaultValue={filters.date ?? ""} />
      </label>
      <label>
        <span>Status</span>
        <select name="status" defaultValue={filters.status ?? ""}>
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="searchLabel">
        <span>Search</span>
        <input name="search" type="search" placeholder="Name or phone" defaultValue={filters.search ?? ""} />
      </label>
      <button type="submit" className="filterButton">
        <Search size={16} aria-hidden="true" />
        Apply
      </button>
      <Link href="/" className="resetButton">
        <SlidersHorizontal size={16} aria-hidden="true" />
        Reset
      </Link>
    </form>
  );
}
