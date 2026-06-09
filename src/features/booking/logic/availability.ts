import {
  addDays,
  addMinutes,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  set,
  startOfDay,
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { bookingConfig, seededBookings, staff } from "../data/catalogue";
import { createQuote, getService } from "./quote";
import type {
  AvailabilityResponse,
  AvailabilitySlot,
  Booking,
  Staff,
} from "../types";

function toSalonDate(date: Date) {
  return toZonedTime(date, bookingConfig.salonTimezone);
}

function dateIsoInSalon(date: Date) {
  return formatInTimeZone(date, bookingConfig.salonTimezone, "yyyy-MM-dd");
}

function atSalonTime(dateIso: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const base = parseISO(`${dateIso}T00:00:00`);
  const zoned = set(toSalonDate(base), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
  return fromZonedTime(zoned, bookingConfig.salonTimezone);
}

function getWorkingWindow(member: Staff, dateIso: string) {
  const day = parseISO(`${dateIso}T12:00:00`).getDay();
  const hours = member.weeklyHours.find((item) => item.weekday === day);
  if (!hours) return null;

  return {
    start: atSalonTime(dateIso, hours.start),
    end: atSalonTime(dateIso, hours.end),
  };
}

function getBreakWindows(member: Staff, dateIso: string) {
  const day = parseISO(`${dateIso}T12:00:00`).getDay();
  return member.breakWindows
    .filter((item) => item.weekday === day)
    .map((item) => ({
      start: atSalonTime(dateIso, item.start),
      end: atSalonTime(dateIso, item.end),
    }));
}

function intersects(start: Date, end: Date, otherStart: Date, otherEnd: Date) {
  return isBefore(start, otherEnd) && isAfter(end, otherStart);
}

function isBlockedByTimeOff(member: Staff, start: Date, end: Date) {
  return member.timeOff.some((window) =>
    intersects(start, end, parseISO(window.startIso), parseISO(window.endIso)),
  );
}

function getStaffBookings(memberId: string, bookings: Booking[], dateIso: string) {
  return bookings.filter(
    (booking) =>
      booking.staffId === memberId &&
      booking.status === "confirmed" &&
      isSameDay(parseISO(booking.startIso), parseISO(`${dateIso}T12:00:00`)),
  );
}

function canFit(input: {
  member: Staff;
  start: Date;
  end: Date;
  dateIso: string;
  bookings: Booking[];
}) {
  const workingWindow = getWorkingWindow(input.member, input.dateIso);
  if (!workingWindow) return false;
  if (isBefore(input.start, workingWindow.start) || isAfter(input.end, workingWindow.end)) return false;
  if (isBlockedByTimeOff(input.member, input.start, input.end)) return false;

  const breaks = getBreakWindows(input.member, input.dateIso);
  if (breaks.some((window) => intersects(input.start, input.end, window.start, window.end))) {
    return false;
  }

  const existing = getStaffBookings(input.member.id, input.bookings, input.dateIso);
  return !existing.some((booking) =>
    intersects(input.start, input.end, parseISO(booking.startIso), parseISO(booking.endIso)),
  );
}

function periodForHour(hour: number): AvailabilitySlot["period"] {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function getSuggestedDates(input: {
  serviceId: string;
  addOnIds: string[];
  staffId: string | null;
  fromDateIso: string;
  bookings?: Booking[];
}) {
  const suggestions: string[] = [];
  for (let index = 0; index < 14; index += 1) {
    const candidate = addDays(parseISO(`${input.fromDateIso}T12:00:00`), index);
    const dateIso = dateIsoInSalon(candidate);
    const result = getAvailability({
      serviceId: input.serviceId,
      addOnIds: input.addOnIds,
      staffId: input.staffId,
      dateIso,
      bookings: input.bookings,
    });
    if (result.slots.length > 0) {
      suggestions.push(dateIso);
    }
    if (suggestions.length === 4) break;
  }
  return suggestions;
}

export function getAvailability(input: {
  serviceId: string;
  addOnIds: string[];
  staffId: string | null;
  dateIso: string;
  bookings?: Booking[];
}): AvailabilityResponse {
  const service = getService(input.serviceId);
  if (!service) {
    return {
      timezone: bookingConfig.salonTimezone,
      dateIso: input.dateIso,
      slots: [],
      nearbyDates: [],
      suggestions: [],
      alternativeStaffIds: [],
    };
  }

  const bookings = input.bookings ?? seededBookings;
  const quote = createQuote({
    serviceId: input.serviceId,
    addOnIds: input.addOnIds,
    startIso: `${input.dateIso}T09:00:00.000Z`,
  });
  const eligibleStaff = staff.filter((member) => {
    if (!member.supportedServiceIds.includes(input.serviceId)) return false;
    return input.addOnIds.every((addOnId) => member.supportedAddOnIds.includes(addOnId));
  });

  const preferred = input.staffId
    ? eligibleStaff.filter((member) => member.id === input.staffId)
    : eligibleStaff;

  const startOfTarget = startOfDay(parseISO(`${input.dateIso}T12:00:00`));
  const leadThreshold = addMinutes(new Date(), bookingConfig.policy.onlineLeadMinutes);

  const slots = preferred.flatMap((member) => {
    const list: AvailabilitySlot[] = [];
    for (let hour = 9; hour <= 18; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        const start = fromZonedTime(
          set(toSalonDate(startOfTarget), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }),
          bookingConfig.salonTimezone,
        );
        const end = addMinutes(start, quote.durationMin);

        if (isBefore(start, leadThreshold)) continue;
        if (
          canFit({
            member,
            start,
            end,
            dateIso: input.dateIso,
            bookings,
          })
        ) {
          list.push({
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            staffId: member.id,
            label: formatInTimeZone(start, bookingConfig.salonTimezone, "HH:mm"),
            period: periodForHour(Number(format(start, "H"))),
          });
        }
      }
    }
    return list;
  });

  const uniqueSlots = slots.filter(
    (slot, index) => slots.findIndex((item) => item.startIso === slot.startIso) === index,
  );

  const alternativeStaffIds = eligibleStaff
    .filter((member) => member.id !== input.staffId)
    .map((member) => member.id);

  const nearbyDates = getSuggestedDates({
    serviceId: input.serviceId,
    addOnIds: input.addOnIds,
    staffId: input.staffId,
    fromDateIso: input.dateIso,
    bookings,
  }).filter((dateIso) => dateIso !== input.dateIso);

  return {
    timezone: bookingConfig.salonTimezone,
    dateIso: input.dateIso,
    slots: uniqueSlots,
    nearbyDates,
    suggestions: uniqueSlots.slice(0, 3),
    alternativeStaffIds,
  };
}
