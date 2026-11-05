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

export type CalendarEventInput = {
  title: string;
  /** Salon wall-clock start, "YYYY-MM-DDTHH:MM". */
  startIso: string;
  durationMinutes: number;
  details: string;
  id: string;
};

/** Caps what a calendar link can carry, since anyone can open the link with their own text. */
export function cleanCalendarInput(input: CalendarEventInput): CalendarEventInput | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(input.startIso)) return null;
  const minutes = Math.round(Number(input.durationMinutes));
  if (!Number.isFinite(minutes)) return null;

  return {
    title: input.title.replace(/[\r\n]+/g, " ").trim().slice(0, 120) || "Pastel appointment",
    startIso: input.startIso.slice(0, 16),
    durationMinutes: Math.min(Math.max(minutes, 15), 600),
    details: input.details.replace(/[\r\n]+/g, " ").trim().slice(0, 300),
    id: input.id.replace(/[^\w-]/g, "").slice(0, 64) || "appointment",
  };
}

function eventTimes(input: CalendarEventInput) {
  const start = salonTimeToUtc(input.startIso);
  const end = new Date(start.getTime() + Math.max(input.durationMinutes, 15) * 60_000);
  return { start, end };
}

/** Calendar files wrap lines longer than 75 characters onto lines that start with a space. */
function foldIcsLine(line: string) {
  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += chunks.length ? 74 : 75) {
    chunks.push(line.slice(index, index + (chunks.length ? 74 : 75)));
  }
  return chunks.join("\r\n ");
}

/** The .ics text, with alerts 1 day and 2 hours before. */
export function buildCalendarFile(input: CalendarEventInput) {
  const { start, end } = eventTimes(input);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pastel Nail Salon//Booking//EN",
    "METHOD:PUBLISH",
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

  return lines.map(foldIcsLine).join("\r\n");
}

/**
 * A link to the site's /calendar route, which serves the .ics as a real file. iPhones open that
 * straight in Calendar; an embedded data: file is ignored by Safari and in-app browsers.
 */
export function buildCalendarFileUrl(input: CalendarEventInput) {
  const params = new URLSearchParams({
    t: input.title,
    s: input.startIso.slice(0, 16),
    m: String(input.durationMinutes),
    d: input.details,
    id: input.id,
  });
  return `/calendar?${params.toString()}`;
}

/** Opens Google Calendar with the event filled in; works in any browser, including in-app ones. */
export function buildGoogleCalendarUrl(input: CalendarEventInput) {
  const { start, end } = eventTimes(input);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${formatIcsDate(start)}/${formatIcsDate(end)}`,
    details: `${input.details}\nQuestions? Call ${SALON_PHONE}`,
    location: SALON_LOCATION,
    ctz: SALON_TIME_ZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
