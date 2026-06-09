import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

const defaultLocale = enGB;

export function currency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function longDate(dateIso: string) {
  return format(parseISO(`${dateIso}T12:00:00`), "EEEE d MMMM", {
    locale: defaultLocale,
  });
}

export function shortDate(dateIso: string) {
  return format(parseISO(`${dateIso}T12:00:00`), "EEE d MMM", {
    locale: defaultLocale,
  });
}

export function monthLabel(date: Date) {
  return format(date, "MMMM yyyy", { locale: defaultLocale });
}

export function timeLabel(iso: string, timezone: string) {
  return formatInTimeZone(iso, timezone, "HH:mm");
}

export function dateTimeLabel(iso: string, timezone: string) {
  return formatInTimeZone(iso, timezone, "EEE d MMM, HH:mm");
}

export function dateInputValue(iso: string) {
  return format(parseISO(iso), "yyyy-MM-dd");
}
