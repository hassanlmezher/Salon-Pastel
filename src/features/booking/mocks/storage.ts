import { seededBookings } from "../data/catalogue";
import type { Booking, DraftBooking } from "../types";

const draftKey = "salon-pastel-draft";
const bookingsKey = "salon-pastel-bookings";

const defaultGuest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  consent: false,
};

export const defaultDraft: DraftBooking = {
  serviceId: null,
  addOnIds: [],
  staffId: null,
  selectedDate: null,
  selectedSlotIso: null,
  guest: defaultGuest,
};

export function readDraft() {
  if (typeof window === "undefined") return defaultDraft;
  const raw = window.localStorage.getItem(draftKey);
  if (!raw) return defaultDraft;
  try {
    return { ...defaultDraft, ...JSON.parse(raw) } as DraftBooking;
  } catch {
    return defaultDraft;
  }
}

export function writeDraft(draft: DraftBooking) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey);
}

export function readBookings() {
  if (typeof window === "undefined") return seededBookings;
  const raw = window.sessionStorage.getItem(bookingsKey);
  if (!raw) {
    window.sessionStorage.setItem(bookingsKey, JSON.stringify(seededBookings));
    return seededBookings;
  }
  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    return seededBookings;
  }
}

export function writeBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(bookingsKey, JSON.stringify(bookings));
}
