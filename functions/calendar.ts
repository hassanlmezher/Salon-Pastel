import { buildCalendarFile, cleanCalendarInput } from "../src/features/booking/logic/calendarFile";

/** GET /calendar?t=&s=&m=&d=&id= serves one appointment as an .ics file that phones add to their calendar. */
export const onRequestGet = ({ request }: { request: Request }) => {
  const params = new URL(request.url).searchParams;
  const input = cleanCalendarInput({
    title: params.get("t") ?? "",
    startIso: params.get("s") ?? "",
    durationMinutes: Number(params.get("m")),
    details: params.get("d") ?? "",
    id: params.get("id") ?? "",
  });

  if (!input) return new Response("Invalid appointment link.", { status: 400 });

  return new Response(buildCalendarFile(input), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pastel-appointment.ics"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
};
