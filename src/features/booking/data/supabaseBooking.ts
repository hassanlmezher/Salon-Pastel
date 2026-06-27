import { getSupabaseClient } from "../../../lib/supabaseClient";
import {
  getServiceBySlugFromList,
  getServiceImage,
  getServiceSlug,
  isPrimaryServiceSlug,
  normalizeServiceMenuItem,
  type ServiceGroupId,
  type ServiceMenuItem,
} from "./serviceMenu";

export type AvailableSlot = {
  startIso: string;
  label: string;
};

type RawService = Record<string, unknown> & {
  id?: string;
  name?: string;
  price?: number | string | null;
  duration_minutes?: number | null;
  duration?: number | string | null;
  description?: string | null;
  service_categories?: Record<string, unknown> | null;
};

type RawSlot = Record<string, unknown> | string;

const activeServicesCache = new Map<ServiceGroupId, Promise<ServiceMenuItem[]>>();

function formatPrice(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return `$${value}`;
  const text = String(value);
  return text.startsWith("$") ? text : `$${text}`;
}

function formatDuration(service: RawService) {
  const raw = service.duration_minutes ?? service.duration;
  if (raw === null || raw === undefined || raw === "") return "";
  if (typeof raw === "number") return `${raw} min`;
  const text = String(raw);
  return text.toLowerCase().includes("min") ? text : `${text} min`;
}

function getCategoryName(service: RawService) {
  const category = service.service_categories;
  if (!category) return "";
  return String(category.name ?? category.title ?? category.slug ?? "");
}

function belongsToGroup(service: RawService, groupId: ServiceGroupId) {
  const categoryName = getCategoryName(service).toLowerCase();
  const serviceName = String(service.name ?? "").toLowerCase();
  if (categoryName) return categoryName.includes(groupId);
  return categoryName.includes(groupId) || serviceName.includes(groupId);
}

function getServiceGroupFromCategory(categoryName: string): ServiceGroupId {
  return categoryName.toLowerCase().includes("pedicure") ? "pedicure" : "manicure";
}

function mapService(service: RawService): ServiceMenuItem | null {
  if (!service.id || !service.name) return null;

  const categoryName = getCategoryName(service);
  const groupId = getServiceGroupFromCategory(categoryName);

  return normalizeServiceMenuItem({
    id: service.id,
    name: service.name,
    slug: getServiceSlug(service.name),
    imageSrc: getServiceImage(service.name, categoryName),
    price: formatPrice(service.price),
    description:
      service.description ??
      `Select ${service.name.toLowerCase()} to continue your appointment.`,
    duration: formatDuration(service),
    serviceType: categoryName || "Salon Service",
  }, groupId);
}

async function loadActiveServices(groupId: ServiceGroupId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("services")
    .select("*, service_categories(*)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as RawService[])
    .filter((service) => belongsToGroup(service, groupId))
    .map(mapService)
    .filter((service): service is ServiceMenuItem => Boolean(service))
    .filter((service) => isPrimaryServiceSlug(groupId, service.slug))
    .filter((service, index, list) => list.findIndex((item) => item.slug === service.slug) === index);
}

export async function fetchActiveServices(groupId: ServiceGroupId) {
  if (!activeServicesCache.has(groupId)) {
    activeServicesCache.set(groupId, loadActiveServices(groupId));
  }

  try {
    return await activeServicesCache.get(groupId)!;
  } catch (error) {
    activeServicesCache.delete(groupId);
    throw error;
  }
}

export async function fetchServiceBySlug(groupId: ServiceGroupId, serviceSlug: string) {
  const services = await fetchActiveServices(groupId);
  return getServiceBySlugFromList(services, serviceSlug);
}

function getSlotStart(slot: RawSlot) {
  if (typeof slot === "string") return slot;

  return (
    slot.appointment_start ??
    slot.slot_start ??
    slot.start_time ??
    slot.start ??
    slot.available_start ??
    null
  );
}

function formatSlotLabel(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function fetchAvailableSlots(serviceId: string, dateIso: string): Promise<AvailableSlot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_service_id: serviceId,
    p_date: dateIso,
  });

  if (error) throw error;

  return ((data ?? []) as RawSlot[])
    .map((slot) => {
      const rawStart = getSlotStart(slot);
      if (!rawStart) return null;

      const date = new Date(String(rawStart));
      if (Number.isNaN(date.getTime())) return null;

      return {
        startIso: String(rawStart),
        label: formatSlotLabel(date),
      };
    })
    .filter((slot): slot is AvailableSlot => Boolean(slot));
}

function getMonthDates(monthStartIso: string) {
  const [year, month] = monthStartIso.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
}

export async function fetchAvailableSlotsForMonth(serviceId: string, monthStartIso: string): Promise<AvailableSlot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_available_slots_for_month", {
    p_service_id: serviceId,
    p_month_start: monthStartIso,
  });

  if (!error) {
    return ((data ?? []) as RawSlot[])
      .map((slot) => {
        const rawStart = getSlotStart(slot);
        if (!rawStart) return null;

        const date = new Date(String(rawStart));
        if (Number.isNaN(date.getTime())) return null;

        return {
          startIso: String(rawStart),
          label: formatSlotLabel(date),
        };
      })
      .filter((slot): slot is AvailableSlot => Boolean(slot));
  }

  const dailySlots = await Promise.all(
    getMonthDates(monthStartIso).map((dateIso) => fetchAvailableSlots(serviceId, dateIso)),
  );

  return dailySlots.flat();
}

export async function createAppointment(input: {
  serviceId: string;
  customerFullName: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone: string;
  appointmentStart: string;
  selectedServices?: Array<{
    id?: string | null;
    slug?: string | null;
    kind?: "service" | "add_on";
    name: string;
    price?: number | string | null;
    duration_minutes?: number | null;
  }>;
  totalPrice?: number;
  totalDurationMinutes?: number;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service_id: input.serviceId,
    p_customer_full_name: input.customerFullName,
    p_customer_phone: input.customerPhone,
    p_appointment_start: input.appointmentStart,
    p_customer_first_name: input.customerFirstName ?? null,
    p_customer_last_name: input.customerLastName ?? null,
    p_selected_services: input.selectedServices ?? null,
    p_total_price: input.totalPrice ?? null,
    p_total_duration_minutes: input.totalDurationMinutes ?? null,
  });

  if (!error) return String(data ?? "");

  if (!isCreateAppointmentSignatureError(error)) throw error;

  const { data: fallbackData, error: fallbackError } = await supabase.rpc("create_appointment", {
    p_service_id: input.serviceId,
    p_customer_full_name: input.customerFullName,
    p_customer_phone: input.customerPhone,
    p_appointment_start: input.appointmentStart,
  });

  if (fallbackError) throw fallbackError;
  return String(fallbackData ?? "");
}

function isCreateAppointmentSignatureError(error: unknown) {
  const details = typeof error === "object" && error !== null ? error as Record<string, unknown> : {};
  const message = String(details.message ?? details.details ?? details.hint ?? error ?? "").toLowerCase();

  return (
    String(details.code ?? "") === "PGRST202" ||
    message.includes("could not find the function") ||
    message.includes("schema cache") ||
    message.includes("p_customer_first_name") ||
    message.includes("p_selected_services")
  );
}

export function getBookingErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (
    normalized.includes("booked") ||
    normalized.includes("conflict") ||
    normalized.includes("duplicate") ||
    normalized.includes("overlap") ||
    normalized.includes("available")
  ) {
    return "This time was just booked. Please choose another time.";
  }

  return "Something went wrong while booking your appointment. Please try again.";
}
