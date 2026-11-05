"use client";

import Link from "next/link";
import { LogOut, Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { logoutOwner } from "../actions";
import Loading from "../loading";
import { AppointmentList } from "./AppointmentList";
import { DayPicker } from "./DayPicker";
import {
  AdminAuthError,
  getAdminAppointments,
  getSalonTodayIso,
  parseAdminFilters,
} from "../../src/features/admin/data/adminAppointments";
import type { AdminAppointment, AdminAppointmentFilters, AppointmentStatus } from "../../src/features/admin/types";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://pastel-salon.pages.dev/book";

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

export function AdminHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const filters = useMemo(
    () => parseAdminFilters(Object.fromEntries(new URLSearchParams(queryString).entries())),
    [queryString],
  );
  // Status tabs filter the loaded list, so only day, view and search fetch again.
  const fetchKey = `${filters.view}|${filters.date}|${filters.search}`;
  const [appointments, setAppointments] = useState<AdminAppointment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const today = getSalonTodayIso();

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);

    getAdminAppointments(filters)
      .then((list) => {
        if (!cancelled) setAppointments(list);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof AdminAuthError) {
          router.replace(error.reason === "not_owner" ? "/login?error=not_owner" : "/login");
          return;
        }
        console.error("Unable to load appointments", error);
        setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // fetchKey covers the filter fields the query uses.
  }, [fetchKey, reloadCount]);

  function handleStatusSaved(appointmentId: string, status: AppointmentStatus) {
    setAppointments((current) =>
      current?.map((appointment) => (appointment.id === appointmentId ? { ...appointment, status } : appointment)) ?? null,
    );
  }

  if (!appointments && !loadError) return <Loading />;

  const list = appointments ?? [];
  const visibleAppointments = filters.status ? list.filter((appointment) => appointment.status === filters.status) : list;

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

      <a href={`${BOOKING_URL}?from=admin`} className="adminNewButton">
        <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
        New appointment
      </a>

      <form
        className="adminSearch"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const search = String(new FormData(event.currentTarget).get("search") ?? "").trim();
          router.push(buildHref(filters, { search }));
        }}
      >
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          key={filters.search}
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
        <DayPicker value={filters.date} today={today} />
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
            <span>{countStatus(list, tab.value)}</span>
          </Link>
        ))}
      </nav>

      {loadError ? (
        <section className="adminEmpty" role="alert">
          <h2>Could not load appointments</h2>
          <p>Check the connection and try again.</p>
          <button type="button" className="loginSubmit adminRetry" onClick={() => setReloadCount((count) => count + 1)}>
            Try again
          </button>
        </section>
      ) : (
        <AppointmentList appointments={visibleAppointments} today={today} onStatusSaved={handleStatusSaved} />
      )}
    </main>
  );
}
