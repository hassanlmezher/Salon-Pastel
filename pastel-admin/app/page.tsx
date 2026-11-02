import Link from "next/link";
import { LogOut, Plus, Search, X } from "lucide-react";
import { logoutOwner } from "./actions";
import { AppointmentList } from "./components/AppointmentList";
import { DayPicker } from "./components/DayPicker";
import { getAdminAppointments, getSalonTodayIso, parseAdminFilters } from "../src/features/admin/data/adminAppointments";
import type { AdminAppointment, AdminAppointmentFilters } from "../src/features/admin/types";

export const dynamic = "force-dynamic";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://pastel-booking.hassanmezher084.workers.dev/book";

const viewTabs = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "All", value: "all" },
] as const;

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "booked" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Done", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildHref(filters: AdminAppointmentFilters, changes: Partial<AdminAppointmentFilters>) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.date) params.set("date", next.date);
  else if (next.view !== "upcoming") params.set("view", next.view);
  if (next.status) params.set("status", next.status);
  if (next.search) params.set("search", next.search);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function countStatus(appointments: AdminAppointment[], status: string) {
  return status ? appointments.filter((appointment) => appointment.status === status).length : appointments.length;
}

export default async function AdminHomePage({ searchParams }: PageProps) {
  const filters = parseAdminFilters((await searchParams) ?? {});
  const appointments = await getAdminAppointments(filters);
  const visibleAppointments = filters.status
    ? appointments.filter((appointment) => appointment.status === filters.status)
    : appointments;

  return (
    <main className="adminPage">
      <header className="adminTopbar">
        <div className="adminBrand">
          <span>Pastel</span>
          <small>Admin</small>
        </div>
        <form action={logoutOwner}>
          <button type="submit" className="adminLogout">
            <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            Log out
          </button>
        </form>
      </header>

      <a href={BOOKING_URL} target="_blank" rel="noopener" className="adminNewButton">
        <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
        New appointment
      </a>

      <form className="adminSearch" action="/" role="search">
        {filters.date ? <input type="hidden" name="date" value={filters.date} /> : null}
        {!filters.date && filters.view !== "upcoming" ? <input type="hidden" name="view" value={filters.view} /> : null}
        {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          name="search"
          type="search"
          enterKeyHint="search"
          placeholder="Search name or phone"
          aria-label="Search name or phone"
          defaultValue={filters.search}
        />
        {filters.search ? (
          <Link href={buildHref(filters, { search: "" })} className="adminSearchClear" aria-label="Clear search">
            <X size={18} strokeWidth={2} />
          </Link>
        ) : null}
      </form>

      <nav className="adminTabs" aria-label="Which days">
        {viewTabs.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(filters, { view: tab.value, date: "" })}
            className={!filters.date && filters.view === tab.value ? "active" : ""}
            aria-current={!filters.date && filters.view === tab.value ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
        <DayPicker value={filters.date} today={getSalonTodayIso()} />
      </nav>

      <nav className="adminTabs adminStatusTabs" aria-label="Status">
        {statusTabs.map((tab) => (
          <Link
            key={tab.label}
            href={buildHref(filters, { status: tab.value })}
            className={filters.status === tab.value ? "active" : ""}
            aria-current={filters.status === tab.value ? "page" : undefined}
            data-status={tab.value || "all"}
          >
            {tab.label}
            <span>{countStatus(appointments, tab.value)}</span>
          </Link>
        ))}
      </nav>

      <AppointmentList appointments={visibleAppointments} today={getSalonTodayIso()} />
    </main>
  );
}
