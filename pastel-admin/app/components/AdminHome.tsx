"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LogOut, Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { logoutOwner } from "../actions";
import Loading from "../loading";
import { AppointmentList, formatReminderDay, toWhatsAppNumber } from "./AppointmentList";
import { formatSlotTime } from "./RescheduleForm";
import { DayPicker } from "./DayPicker";
import {
  AdminAuthError,
  addDaysIso,
  getAdminAppointments,
  getFilterDay,
  getSalonTodayIso,
  parseAdminFilters,
} from "../../src/features/admin/data/adminAppointments";
import type { AdminAppointment, AdminAppointmentFilters, AppointmentStatus } from "../../src/features/admin/types";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://pastel-salon.pages.dev/book";

const viewTabs = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Next 7 days", value: "week" },
  { label: "Past", value: "past" },
] as const;

const SEARCH_DELAY_MS = 300;

type MovedNotice = { name: string; phone: string; newStart: string };

/** WhatsApp message telling the customer about the new time, in English and Arabic like the reminder. */
function movedMessageLink(notice: MovedNotice) {
  const firstName = notice.name.trim().split(/\s+/)[0] || "there";
  const dateKey = notice.newStart.slice(0, 10);
  const time = formatSlotTime(notice.newStart);
  const message = [
    `Hi ${firstName}, your Pastel appointment has been moved to ${formatReminderDay(dateKey, "en-GB")} at ${time}. See you then!`,
    `مرحباً ${firstName}، تم تغيير موعدكِ في Pastel إلى يوم ${formatReminderDay(dateKey, "ar-LB-u-nu-latn")} الساعة ${time}. نراكِ قريباً!`,
  ].join("\n\n");
  return `https://wa.me/${toWhatsAppNumber(notice.phone)}?text=${encodeURIComponent(message)}`;
}

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

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function formatLongDay(dateIso: string, today: string, length: "long" | "short" = "long") {
  const label = new Date(`${dateIso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: length,
    day: "numeric",
    month: length,
    ...(dateIso.slice(0, 4) !== today.slice(0, 4) ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
  if (dateIso === today) return `Today · ${label}`;
  if (dateIso === addDaysIso(today, 1)) return `Tomorrow · ${label}`;
  if (dateIso === addDaysIso(today, -1)) return `Yesterday · ${label}`;
  return label;
}

const viewSummaries: Record<string, string> = {
  upcoming: "from today on",
  week: "in the next 7 days",
  past: "before today",
};

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
  const [movedNotice, setMovedNotice] = useState<MovedNotice | null>(null);
  const today = getSalonTodayIso();
  const day = filters.search ? "" : getFilterDay(filters, today);
  const [searchText, setSearchText] = useState(filters.search);

  // Follow the URL when the search changes from outside the box (clear, a range tab, back button).
  useEffect(() => {
    setSearchText((current) => (current.trim() === filters.search ? current : filters.search));
  }, [filters.search]);

  // Results update while typing, after a short pause.
  useEffect(() => {
    const search = searchText.trim();
    if (search === filters.search) return;
    const timer = window.setTimeout(() => router.replace(buildHref(filters, { search })), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [searchText, filters, router]);

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

  function handleMoved(appointment: AdminAppointment, newStart: string) {
    setMovedNotice({ name: appointment.customerFullName, phone: appointment.customerPhone, newStart });
    // Reload so the appointment shows under its new day, or leaves a view it no longer fits.
    setReloadCount((count) => count + 1);
  }

    function handleStatusSaved(appointmentId: string, status: AppointmentStatus) {
    setAppointments((current) =>
      current?.map((appointment) => (appointment.id === appointmentId ? { ...appointment, status } : appointment)) ?? null,
    );
  }

  if (!appointments && !loadError) return <Loading />;

  const list = appointments ?? [];
  const visibleAppointments = filters.status ? list.filter((appointment) => appointment.status === filters.status) : list;
  const visibleTotal = visibleAppointments
    .filter((appointment) => appointment.status !== "cancelled")
    .reduce((sum, appointment) => sum + appointment.totalPrice, 0);
  const filtered = Boolean(filters.search || filters.status || filters.date || filters.view !== "upcoming");
  const pickedDay = filters.date && filters.date !== today && filters.date !== addDaysIso(today, 1) ? filters.date : "";
  const rangeLabel = filters.search
    ? `for “${filters.search}” on all dates`
    : day
      ? ""
      : viewSummaries[filters.view] ?? "";

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
          const search = searchText.trim();
          if (search !== filters.search) router.replace(buildHref(filters, { search }));
          (document.activeElement as HTMLElement | null)?.blur();
        }}
      >
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          name="search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search name or phone"
          aria-label="Search name or phone on any date"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        {searchText ? (
          <button
            type="button"
            className="adminSearchClear"
            aria-label="Clear search"
            onClick={() => {
              setSearchText("");
              router.replace(buildHref(filters, { search: "" }));
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        ) : null}
      </form>

      <nav className="adminTabs adminRangeTabs" aria-label="Which days">
        {viewTabs.map((tab) => {
          const active = !filters.search && (
            tab.value === "today"
              ? day === today
              : tab.value === "tomorrow"
                ? day === addDaysIso(today, 1)
                : !filters.date && filters.view === tab.value
          );
          return (
            <Link
              key={tab.value}
              href={buildHref(filters, { view: tab.value, date: "", search: "" })}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
        <DayPicker value={pickedDay} active={!filters.search && Boolean(pickedDay)} today={today} />
      </nav>

      {day ? (
        <div className="adminDayNav">
          <Link href={buildHref(filters, { date: addDaysIso(day, -1) })} aria-label="Previous day">
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
          <strong>
            <span className="adminDayNavLong">{formatLongDay(day, today)}</span>
            <span className="adminDayNavShort">{formatLongDay(day, today, "short")}</span>
          </strong>
          <Link href={buildHref(filters, { date: addDaysIso(day, 1) })} aria-label="Next day">
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      ) : null}

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

      {!loadError ? (
        <div className="adminSummary" aria-live="polite">
          <p>
            <strong>
              {visibleAppointments.length} {visibleAppointments.length === 1 ? "appointment" : "appointments"}
            </strong>
            {visibleTotal ? ` · ${formatMoney(visibleTotal)}` : ""}
            {rangeLabel ? ` ${rangeLabel}` : ""}
          </p>
          {filtered ? (
            <Link href="/" className="adminClearFilters" onClick={() => setSearchText("")}>
              Clear filters
            </Link>
          ) : null}
        </div>
      ) : null}

      {loadError ? (
        <section className="adminEmpty" role="alert">
          <h2>Could not load appointments</h2>
          <p>Check the connection and try again.</p>
          <button type="button" className="loginSubmit adminRetry" onClick={() => setReloadCount((count) => count + 1)}>
            Try again
          </button>
        </section>
      ) : (
        <>
          {movedNotice ? (
            <div className="adminNotice" role="status">
              <p>
                Moved <strong>{movedNotice.name}</strong> to {formatReminderDay(movedNotice.newStart.slice(0, 10), "en-GB")} at{" "}
                {formatSlotTime(movedNotice.newStart)}.
              </p>
              <div className="adminNoticeActions">
                {movedNotice.phone ? (
                  <a href={movedMessageLink(movedNotice)} target="_blank" rel="noopener">
                    Tell them on WhatsApp
                  </a>
                ) : null}
                <button type="button" onClick={() => setMovedNotice(null)}>
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}
          <AppointmentList
            appointments={visibleAppointments}
            today={today}
            onStatusSaved={handleStatusSaved}
            onMoved={handleMoved}
          />
        </>
      )}
    </main>
  );
}
