import { getSupabaseClient } from "../../../lib/supabase/client";
import {
  appointmentStatuses,
  appointmentViews,
  type AdminAppointment,
  type AdminAppointmentFilters,
  type AdminSelectedService,
  type AppointmentStatus,
  type AppointmentView,
} from "../types";

type RawService = {
  id?: string | null;
  name?: string | null;
  price?: number | string | null;
  duration_minutes?: number | null;
};

type RawAppointment = {
  id: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_full_name?: string | null;
  customer_phone?: string | null;
  selected_services?: unknown;
  total_price?: number | string | null;
  total_duration_minutes?: number | null;
  appointment_start?: string | null;
  appointment_end?: string | null;
  status?: string | null;
  services?: RawService | RawService[] | null;
};

const ADMIN_QUERY_TIMEOUT_MS = 8000;
const SALON_TIME_ZONE = "Asia/Beirut";

async function withAdminQueryTimeout<T>(query: (signal: AbortSignal) => T): Promise<Awaited<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_QUERY_TIMEOUT_MS);

  try {
    return await query(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAppointmentStatus(value: string | undefined): value is AppointmentStatus {
  return appointmentStatuses.includes(value as AppointmentStatus);
}

function isAppointmentView(value: unknown): value is AppointmentView {
  return appointmentViews.includes(value as AppointmentView);
}

export function parseAdminFilters(searchParams: Record<string, string | string[] | undefined>): AdminAppointmentFilters {
  const date = typeof searchParams.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date) ? searchParams.date : "";
  const view = isAppointmentView(searchParams.view) ? searchParams.view : "upcoming";
  const status = typeof searchParams.status === "string" && isAppointmentStatus(searchParams.status) ? searchParams.status : "";
  const search = typeof searchParams.search === "string" ? searchParams.search.trim() : "";

  return { view, date, status, search };
}

function getService(raw: RawAppointment) {
  if (Array.isArray(raw.services)) return raw.services[0] ?? null;
  return raw.services ?? null;
}

function parseNumeric(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function parseWallClockTimestamp(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return Number.NaN;

  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
  );
}

function getSalonWallClockTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

export function getSalonTodayIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeSelectedServices(raw: RawAppointment, fallbackService: RawService | null): AdminSelectedService[] {
  if (Array.isArray(raw.selected_services)) {
    const selectedServices: AdminSelectedService[] = [];

    raw.selected_services.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const service = item as Record<string, unknown>;
      const name = typeof service.name === "string" ? service.name : "";
      if (!name) return;

      selectedServices.push({
        id: typeof service.id === "string" ? service.id : null,
        slug: typeof service.slug === "string" ? service.slug : null,
        kind: typeof service.kind === "string" ? service.kind : null,
        name,
        price: typeof service.price === "number" || typeof service.price === "string" ? service.price : null,
        duration_minutes: typeof service.duration_minutes === "number" ? service.duration_minutes : null,
      });
    });

    return selectedServices;
  }

  if (fallbackService?.name) {
    return [
      {
        id: fallbackService.id,
        kind: "service",
        name: fallbackService.name,
        price: fallbackService.price,
        duration_minutes: fallbackService.duration_minutes ?? null,
      },
    ];
  }

  return [];
}

function formatWallClockTime(appointmentStart: string) {
  const match = appointmentStart.match(/T(\d{2}):(\d{2})/);
  if (!match) return "";

  const hour = Number(match[1]);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${match[2]} ${suffix}`;
}

function getNextDateIso(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(year, month - 1, day + 1);
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

function normalizeAppointment(raw: RawAppointment): AdminAppointment {
  const fallbackService = getService(raw);
  const fallbackName = splitFullName(raw.customer_full_name ?? "");
  const customerFirstName = raw.customer_first_name?.trim() || fallbackName.firstName;
  const customerLastName = raw.customer_last_name?.trim() || fallbackName.lastName;
  const selectedServices = normalizeSelectedServices(raw, fallbackService);
  const totalPrice = parseNumeric(raw.total_price) || parseNumeric(fallbackService?.price);
  const totalDurationMinutes = raw.total_duration_minutes ?? fallbackService?.duration_minutes ?? 0;
  const rawStatus = raw.status ?? undefined;
  const storedStatus: AppointmentStatus = isAppointmentStatus(rawStatus) ? rawStatus : "booked";
  const appointmentStart = raw.appointment_start ?? "";
  const startTime = parseWallClockTimestamp(appointmentStart);
  const explicitEndTime = parseWallClockTimestamp(raw.appointment_end ?? "");
  const calculatedEndTime = startTime + totalDurationMinutes * 60_000;
  const endTime = Number.isNaN(explicitEndTime) ? calculatedEndTime : explicitEndTime;
  const isFinished = Number.isFinite(endTime) && endTime <= getSalonWallClockTimestamp();
  const status: AppointmentStatus = storedStatus === "no_show"
    ? "cancelled"
    : storedStatus !== "cancelled" && (storedStatus === "completed" || isFinished)
      ? "completed"
      : storedStatus;

  return {
    id: raw.id,
    customerFullName: `${customerFirstName} ${customerLastName}`.trim() || raw.customer_full_name || "Unknown customer",
    customerPhone: raw.customer_phone ?? "",
    selectedServices,
    dateKey: appointmentStart.slice(0, 10),
    appointmentTime: formatWallClockTime(appointmentStart),
    totalPrice,
    totalDurationMinutes,
    status,
  };
}

/** Thrown when there is no session or the account is not an owner. */
export class AdminAuthError extends Error {
  constructor(readonly reason: "signed_out" | "not_owner") {
    super(reason);
  }
}

/**
 * Loads the appointments for the selected day range and search. Status is
 * filtered by the caller so the status tabs can show counts from one query.
 */
export async function getAdminAppointments(filters: AdminAppointmentFilters) {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new AdminAuthError("signed_out");

  const today = getSalonTodayIso();
  const day = filters.date || (filters.view === "today" ? today : "");
  let query = supabase
    .from("appointments")
    .select(
      [
        "id",
        "customer_first_name",
        "customer_last_name",
        "customer_full_name",
        "customer_phone",
        "selected_services",
        "total_price",
        "total_duration_minutes",
        "appointment_start",
        "appointment_end",
        "status",
        "services(id,name,price,duration_minutes)",
      ].join(","),
    )
    // "All" reads newest first; a day or the upcoming list reads in schedule order.
    .order("appointment_start", { ascending: Boolean(day) || filters.view === "upcoming" })
    .limit(500);

  if (day) {
    query = query.gte("appointment_start", `${day}T00:00:00`).lt("appointment_start", `${getNextDateIso(day)}T00:00:00`);
  } else if (filters.view === "upcoming") {
    query = query.gte("appointment_start", `${today}T00:00:00`);
  }

  // Characters that would break the PostgREST `or` filter syntax are dropped.
  const term = filters.search.replace(/[,()*\\]/g, " ").trim().replace(/[%_]/g, "\\$&");
  if (term) {
    query = query.or(
      [
        `customer_first_name.ilike.%${term}%`,
        `customer_last_name.ilike.%${term}%`,
        `customer_full_name.ilike.%${term}%`,
        `customer_phone.ilike.%${term}%`,
      ].join(","),
    );
  }

  // The owner check runs alongside the list, so a page load is one round trip.
  const [{ data, error }, { data: ownerUser, error: ownerError }] = await Promise.all([
    withAdminQueryTimeout((signal) => query.abortSignal(signal)),
    withAdminQueryTimeout((signal) =>
      supabase.from("owner_users").select("user_id").eq("user_id", session.user.id).abortSignal(signal).maybeSingle(),
    ),
  ]);
  if (error || ownerError) throw error ?? ownerError;
  if (!ownerUser) throw new AdminAuthError("not_owner");

  return ((data ?? []) as unknown as RawAppointment[]).map(normalizeAppointment);
}
