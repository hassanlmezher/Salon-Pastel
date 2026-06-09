import { addMinutes } from "date-fns";
import { bookingConfig, addOns, services, staff } from "../data/catalogue";
import { getAvailability } from "../logic/availability";
import { createQuote } from "../logic/quote";
import { clearDraft, readBookings, writeBookings } from "./storage";
import type { Booking, BookingApi, ServiceOption } from "../types";

const randomDelay = () => 220 + Math.round(Math.random() * 320);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function code() {
  return `PSTL${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function failureKey(date: string) {
  return `salon-pastel-failed-${date}`;
}

async function maybeFailAvailability(date: string) {
  if (typeof window === "undefined") return;
  if (date.endsWith("-20") && !window.sessionStorage.getItem(failureKey(date))) {
    window.sessionStorage.setItem(failureKey(date), "1");
    throw new Error("We could not refresh live availability just now. Please try again.");
  }
}

async function withLatency<T>(action: () => T | Promise<T>) {
  await sleep(randomDelay());
  return action();
}

export const bookingApi: BookingApi = {
  getConfig: () => withLatency(() => bookingConfig),
  getServices: () =>
    withLatency(() => {
      const result: ServiceOption[] = services.map((service) => ({
        service,
        addOns: addOns.filter((item) => item.compatibleServiceIds.includes(service.id)),
      }));
      return result;
    }),
  getStaff: ({ serviceId, addOnIds }) =>
    withLatency(() =>
      staff.filter(
        (member) =>
          member.supportedServiceIds.includes(serviceId) &&
          addOnIds.every((addOnId) => member.supportedAddOnIds.includes(addOnId)),
      ),
    ),
  getAvailability: ({ serviceId, addOnIds, staffId, date }) =>
    withLatency(async () => {
      await maybeFailAvailability(date);
      return getAvailability({
        serviceId,
        addOnIds,
        staffId,
        dateIso: date,
        bookings: readBookings(),
      });
    }),
  quoteBooking: ({ serviceId, addOnIds, startIso }) =>
    withLatency(() => createQuote({ serviceId, addOnIds, startIso })),
  createBooking: ({ serviceId, addOnIds, staffId, startIso, guest }) =>
    withLatency(() => {
      const quote = createQuote({ serviceId, addOnIds, startIso });
      const next: Booking = {
        code: code(),
        status: "confirmed",
        serviceId,
        addOnIds,
        staffId,
        startIso,
        endIso: quote.endIso ?? addMinutes(new Date(startIso), quote.durationMin).toISOString(),
        timezone: bookingConfig.salonTimezone,
        subtotal: quote.subtotal,
        deposit: quote.deposit,
        total: quote.total,
        durationMin: quote.durationMin,
        guest,
        createdAtIso: new Date().toISOString(),
      };
      const bookings = [next, ...readBookings()];
      writeBookings(bookings);
      clearDraft();
      return next;
    }),
  getBooking: (bookingCode) =>
    withLatency(() => readBookings().find((item) => item.code === bookingCode) ?? null),
  rescheduleBooking: ({ code: bookingCode, staffId, startIso }) =>
    withLatency(() => {
      const bookings = readBookings();
      const booking = bookings.find((item) => item.code === bookingCode);
      if (!booking) throw new Error("Booking not found.");
      const quote = createQuote({
        serviceId: booking.serviceId,
        addOnIds: booking.addOnIds,
        startIso,
      });
      booking.staffId = staffId;
      booking.startIso = startIso;
      booking.endIso = quote.endIso ?? booking.endIso;
      booking.durationMin = quote.durationMin;
      writeBookings([...bookings]);
      return booking;
    }),
  cancelBooking: (bookingCode) =>
    withLatency(() => {
      const bookings = readBookings();
      const booking = bookings.find((item) => item.code === bookingCode);
      if (!booking) throw new Error("Booking not found.");
      booking.status = "cancelled";
      writeBookings([...bookings]);
      return booking;
    }),
};
