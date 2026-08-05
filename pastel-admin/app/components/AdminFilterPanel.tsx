"use client";

import { useState } from "react";
import { ArrowDownUp, CalendarDays, ListFilter, Search, SlidersHorizontal, X } from "lucide-react";
import type { AdminAppointmentFilters, AppointmentStatus } from "../../src/features/admin/types";
import { FilterAutoSubmit } from "./FilterAutoSubmit";

const statusLabels: Record<AppointmentStatus, string> = {
  booked: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

function toDateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatFilterDate(value?: string) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return "Select date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminFilterPanel({
  filters,
  action,
  includeSort = false,
}: {
  filters: AdminAppointmentFilters;
  action: string;
  includeSort?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dateValue = filters.date || toDateInputValue(new Date());
  const formId = includeSort ? "appointments-filters" : "dashboard-filters";
  const activeFilterCount = Number(Boolean(filters.date)) + Number(Boolean(filters.status)) +
    Number(includeSort && filters.sort === "oldest");

  return (
    <form id={formId} className={`mobileFilterPanel${isOpen ? " isOpen" : ""}`} action={action}>
      <div className="mobileFilterToolbar">
        <label className="mobileSearchField">
          <Search size={25} strokeWidth={1.8} aria-hidden="true" />
          <input name="search" type="search" placeholder="Search name or phone..." defaultValue={filters.search ?? ""} />
        </label>

        <button
          type="button"
          className="mobileFilterToggle"
          aria-label={isOpen ? "Close filters" : "Open filters"}
          aria-expanded={isOpen}
          aria-controls={`${formId}-options`}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={24} /> : <SlidersHorizontal size={24} />}
          {activeFilterCount > 0 ? <span aria-label={`${activeFilterCount} active filters`}>{activeFilterCount}</span> : null}
        </button>
      </div>

      <div id={`${formId}-options`} className="mobileFilterOptions" hidden={!isOpen}>
        <div className="mobileFilterHeading">
          <div>
            <span>Refine results</span>
            <small>Choose the appointments you want to see</small>
          </div>
          {activeFilterCount > 0 ? <strong>{activeFilterCount} active</strong> : null}
        </div>

        <div className={includeSort ? "mobileFilterGrid three" : "mobileFilterGrid"}>
          <label className="mobileSelectField">
            <CalendarDays size={23} strokeWidth={1.8} aria-hidden="true" />
            <span>{formatFilterDate(dateValue)}</span>
            <input name="date" type="date" defaultValue={dateValue} aria-label="Appointment date" />
          </label>

          <label className="mobileSelectField">
            <ListFilter size={23} strokeWidth={1.8} aria-hidden="true" />
            <span>{filters.status ? statusLabels[filters.status] : "All Status"}</span>
            <select name="status" defaultValue={filters.status ?? ""} aria-label="Appointment status">
              <option value="">All Status</option>
              <option value="booked">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {includeSort ? (
            <label className="mobileSelectField">
              <ArrowDownUp size={23} strokeWidth={1.8} aria-hidden="true" />
              <span>{filters.sort === "oldest" ? "Oldest" : "Newest"}</span>
              <select name="sort" defaultValue={filters.sort ?? "newest"} aria-label="Sort appointments">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <button type="submit" className="mobileFilterSubmit">Apply filters</button>
      <FilterAutoSubmit formId={formId} />
    </form>
  );
}
