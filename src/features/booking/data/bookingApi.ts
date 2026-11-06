import {
  getServiceBySlug,
  getServiceImage,
  getServiceSlug,
  isPrimaryServiceSlug,
  normalizeServiceMenuItem,
  pedicureServices,
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
const API_TIMEOUT_MS = 10_000;
const SALON_TIME_ZONE = "Asia/Beirut";

function getSalonDateTimeParts(date = new Date()) {
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

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getTodayDateIso() {
  const { year, month, day } = getSalonDateTimeParts();
  return `${year}-${month}-${day}`;
}

function getCurrentSalonDateTimeIso() {
  const { year, month, day, hour, minute, second } = getSalonDateTimeParts();
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function isFutureSlot(slot: AvailableSlot) {
  return slot.startIso.slice(0, 19) >= getCurrentSalonDateTimeIso();
}

function mapAvailableSlots(data: RawSlot[]): AvailableSlot[] {
  return data
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
    .filter((slot): slot is AvailableSlot => Boolean(slot))
    .filter(isFutureSlot);
}

/** Calls the site's own /api routes; a slow first request can wake the database, hence the 10s limit. */
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(typeof body?.error === "string" ? body.error : `Request failed (${response.status})`);
    }
    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

type ApiService = {
  id: string;
  name: string;
  price: string | number | null;
  duration_minutes: number | null;
  category: string;
};

let servicesRequest: Promise<RawService[]> | null = null;

/** Both the service list and the booking step read the same list, so it is fetched once per visit. */
function fetchServiceRows() {
  servicesRequest ??= api<ApiService[]>("/api/services")
    .then((rows) => rows.map((row) => ({ ...row, service_categories: { name: row.category } })))
    .catch((error) => {
      servicesRequest = null;
      throw error;
    });
  return servicesRequest;
}

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
  if (groupId === "pedicure") {
    return [...pedicureServices];
  }

  const data = await fetchServiceRows();

  const candidates = data
    .filter((service) => belongsToGroup(service, groupId))
    .map((rawService) => ({
      service: mapService(rawService),
      backendDurationMinutes: Number(rawService.duration_minutes ?? rawService.duration ?? 0),
    }))
    .filter((candidate): candidate is { service: ServiceMenuItem; backendDurationMinutes: number } => Boolean(candidate.service))
    .filter((candidate) => isPrimaryServiceSlug(groupId, candidate.service.slug));

  const bestCandidateBySlug = new Map<string, (typeof candidates)[number]>();
  for (const candidate of candidates) {
    const current = bestCandidateBySlug.get(candidate.service.slug);
    if (!current || candidate.backendDurationMinutes > current.backendDurationMinutes) {
      bestCandidateBySlug.set(candidate.service.slug, candidate);
    }
  }

  return [...bestCandidateBySlug.values()].map((candidate) => candidate.service);
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
  const hardcodedService = getServiceBySlug(groupId, serviceSlug);
  if (!hardcodedService) return null;

  const serviceId = await fetchBookingServiceId(groupId, hardcodedService.slug);
  return serviceId ? { ...hardcodedService, id: serviceId } : hardcodedService;
}

type BookingServiceRecord = RawService & {
  id: string;
  name: string;
};

const bookingServiceIdCache = new Map<string, Promise<string | null>>();

function isBookingServiceInGroup(service: RawService, groupId: ServiceGroupId) {
  const categoryGroup = getServiceGroupFromCategory(getCategoryName(service));
  if (categoryGroup === groupId) return true;

  // This legacy row is a hand service that was entered under Pedicure.
  return groupId === "manicure" && getServiceSlug(String(service.name ?? "")) === "luxary-spa-for-hands";
}

async function fetchBookingServiceId(groupId: ServiceGroupId, serviceSlug: string) {
  const cacheKey = `${groupId}:${serviceSlug}`;
  if (!bookingServiceIdCache.has(cacheKey)) {
    bookingServiceIdCache.set(cacheKey, loadBookingServiceId(groupId, serviceSlug));
  }

  try {
    return await bookingServiceIdCache.get(cacheKey)!;
  } catch (error) {
    bookingServiceIdCache.delete(cacheKey);
    throw error;
  }
}

async function loadBookingServiceId(groupId: ServiceGroupId, serviceSlug: string) {
  const data = await fetchServiceRows();

  const candidates = (data as BookingServiceRecord[])
    .filter((service) => service.id && service.name)
    .filter((service) => isBookingServiceInGroup(service, groupId))
    .filter((service) => getServiceBySlug(groupId, getServiceSlug(service.name))?.slug === serviceSlug)
    .sort((left, right) => Number(right.duration_minutes ?? 0) - Number(left.duration_minutes ?? 0));

  return candidates[0]?.id ?? null;
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

export async function fetchAvailableSlots(
  serviceId: string,
  dateIso: string,
  durationMinutes?: number,
): Promise<AvailableSlot[]> {
  if (dateIso < getTodayDateIso()) return [];

  const params = new URLSearchParams({ service: serviceId, date: dateIso });
  if (durationMinutes) params.set("duration", String(durationMinutes));
  return mapAvailableSlots(await api<string[]>(`/api/slots?${params}`));
}

export async function fetchAvailableSlotsForMonth(
  serviceId: string,
  monthStartIso: string,
  durationMinutes?: number,
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({ service: serviceId, month: monthStartIso });
  if (durationMinutes) params.set("duration", String(durationMinutes));
  return mapAvailableSlots(await api<string[]>(`/api/slots?${params}`));
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
  const { id } = await api<{ id?: string }>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return requireAppointmentId(id);
}

function requireAppointmentId(value: unknown) {
  const appointmentId = String(value ?? "").trim();
  if (!appointmentId) {
    throw new Error("The appointment was not saved. Please try again.");
  }
  return appointmentId;
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

  if (normalized.includes("past") || normalized.includes("future")) {
    return "Appointments must be booked for today or a future date.";
  }

  return "Something went wrong while booking your appointment. Please try again.";
}
