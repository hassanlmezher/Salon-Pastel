import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import {
  appointmentStatuses,
  type AdminAppointment,
  type AdminAppointmentFilters,
  type AdminSelectedService,
  type AppointmentStatus,
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

export function parseAdminFilters(searchParams: Record<string, string | string[] | undefined>): AdminAppointmentFilters {
  const date = typeof searchParams.date === "string" ? searchParams.date : "";
  const status = typeof searchParams.status === "string" && isAppointmentStatus(searchParams.status) ? searchParams.status : "";
  const search = typeof searchParams.search === "string" ? searchParams.search.trim() : "";
  const sort = searchParams.sort === "oldest" ? "oldest" : "newest";

  return { date, status, search, sort };
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

function formatDateTime(appointmentStart: string | null | undefined) {
  if (!appointmentStart) {
    return { date: "", time: "" };
  }

  const date = new Date(appointmentStart);
  if (Number.isNaN(date.getTime())) {
    return { date: appointmentStart.slice(0, 10), time: "" };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
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
  const dateTime = formatDateTime(raw.appointment_start);
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
    customerFirstName,
    customerLastName,
    customerFullName: `${customerFirstName} ${customerLastName}`.trim() || raw.customer_full_name || "Unknown customer",
    customerPhone: raw.customer_phone ?? "",
    selectedServices,
    appointmentDate: dateTime.date,
    appointmentTime: dateTime.time,
    appointmentStart,
    totalPrice,
    totalDurationMinutes,
    status,
  };
}

export async function requireOwnerUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ownerUser } = await withAdminQueryTimeout((signal) =>
    supabase
      .from("owner_users")
      .select("user_id")
      .eq("user_id", user.id)
      .abortSignal(signal)
      .maybeSingle(),
  );

  if (!ownerUser) redirect("/login?error=not_owner");

  return { supabase, user };
}

export async function getAdminAppointments(filters: AdminAppointmentFilters) {
  const { supabase } = await requireOwnerUser();
  const sortAscending = filters.sort === "oldest";
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
    .order("appointment_start", { ascending: sortAscending })
    .limit(1000);

  if (filters.date) {
    const start = `${filters.date}T00:00:00`;
    const end = `${getNextDateIso(filters.date)}T00:00:00`;
    query = query.gte("appointment_start", start).lt("appointment_start", end);
  }

  if (filters.status === "cancelled") {
    query = query.in("status", ["cancelled", "no_show"]);
  } else if (filters.status && filters.status !== "completed") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, "\\$&");
    query = query.or(
      [
        `customer_first_name.ilike.%${term}%`,
        `customer_last_name.ilike.%${term}%`,
        `customer_full_name.ilike.%${term}%`,
        `customer_phone.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error } = await withAdminQueryTimeout((signal) => query.abortSignal(signal));
  if (error) throw error;

  const appointments = ((data ?? []) as unknown as RawAppointment[]).map(normalizeAppointment);

  return filters.status
    ? appointments.filter((appointment) => appointment.status === filters.status)
    : appointments;
}
