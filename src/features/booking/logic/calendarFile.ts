const SALON_TIME_ZONE = "Asia/Beirut";
const SALON_LOCATION = "Pastel Nail Salon";
const SALON_PHONE = "+961 71 430 542";

/** Converts a salon wall-clock time ("2026-11-03T08:00:00") to a UTC Date. */
function salonTimeToUtc(wallClockIso: string) {
  const [datePart, timePart = "00:00"] = wallClockIso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);

  // The salon's UTC offset on that date (it changes with daylight saving).
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SALON_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(asUtc))
      .map((part) => [part.type, part.value]),
  );
  const salonAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));

  return new Date(asUtc - (salonAsUtc - asUtc));
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** A data: URL for an .ics event that phones open straight in their calendar app. */
export function buildCalendarFileUrl(input: { title: string; startIso: string; durationMinutes: number; details: string; id: string }) {
  const start = salonTimeToUtc(input.startIso);
  const end = new Date(start.getTime() + Math.max(input.durationMinutes, 15) * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pastel Nail Salon//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${input.id}@pastel-salon`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    `DESCRIPTION:${escapeIcsText(`${input.details}\nQuestions? Call ${SALON_PHONE}`)}`,
    `LOCATION:${escapeIcsText(SALON_LOCATION)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Pastel appointment tomorrow",
    "TRIGGER:-P1D",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Pastel appointment in 2 hours",
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
