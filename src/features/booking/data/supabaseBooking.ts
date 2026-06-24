import { getSupabaseClient } from "../../../lib/supabaseClient";
import {
  getServiceBySlugFromList,
  getServiceImage,
  getServiceSlug,
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
  return categoryName.includes(groupId) || serviceName.includes(groupId);
}

function mapService(service: RawService): ServiceMenuItem | null {
  if (!service.id || !service.name) return null;

  const categoryName = getCategoryName(service);

  return {
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
  };
}

export async function fetchActiveServices(groupId: ServiceGroupId) {
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
    .filter((service): service is ServiceMenuItem => Boolean(service));
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

export async function createAppointment(input: {
  serviceId: string;
  customerFullName: string;
  customerPhone: string;
  appointmentStart: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service_id: input.serviceId,
    p_customer_full_name: input.customerFullName,
    p_customer_phone: input.customerPhone,
    p_appointment_start: input.appointmentStart,
  });

  if (error) throw error;
  return data;
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
