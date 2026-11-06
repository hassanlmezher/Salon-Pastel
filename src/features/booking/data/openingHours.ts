/** One weekday from /api/hours (0 = Sunday); times are "HH:MM" in salon time. */
export type OpeningDay = { day: number; open: boolean; opensAt: string | null; closesAt: string | null };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// The salon week reads Monday to Sunday.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const DEFAULT_HOURS_LABEL = "Tue–Sun 8 am – 3 pm · Closed Mon";

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 || 12;
  return minutes ? `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}` : `${hour12} ${suffix}`;
}

function dayRange(days: number[]) {
  const first = DAY_NAMES[days[0]];
  if (days.length === 1) return first;
  return `${first}${days.length === 2 ? ", " : "–"}${DAY_NAMES[days[days.length - 1]]}`;
}

/** Joins days in a row with the same hours: "Tue–Sun 8 am – 3 pm · Closed Mon". */
export function formatOpeningHours(hours: OpeningDay[]) {
  const byDay = new Map(hours.map((item) => [item.day, item]));
  const groups: { key: string; days: number[] }[] = [];
  for (const day of WEEK_ORDER) {
    const item = byDay.get(day);
    const key = item?.open && item.opensAt && item.closesAt ? `${formatTime(item.opensAt)} – ${formatTime(item.closesAt)}` : "closed";
    const last = groups[groups.length - 1];
    if (last?.key === key) last.days.push(day);
    else groups.push({ key, days: [day] });
  }

  const open = groups.filter((group) => group.key !== "closed").map((group) => `${dayRange(group.days)} ${group.key}`);
  const closed = groups.filter((group) => group.key === "closed").flatMap((group) => group.days.map((day) => DAY_NAMES[day]));
  if (!open.length) return "Closed this week";
  return [...open, ...(closed.length ? [`Closed ${closed.join(", ")}`] : [])].join(" · ");
}

export async function fetchOpeningHoursLabel() {
  const response = await fetch("/api/hours");
  if (!response.ok) throw new Error(`Opening hours request failed: ${response.status}`);
  const hours = (await response.json()) as OpeningDay[];
  return Array.isArray(hours) && hours.length === 7 ? formatOpeningHours(hours) : DEFAULT_HOURS_LABEL;
}
