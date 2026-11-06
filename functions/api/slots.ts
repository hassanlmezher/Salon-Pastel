import { DATE_PATTERN, UUID_PATTERN, bookingSql, json, serverError, type BookingEnv } from "../../server/bookingDb";

/**
 * GET /api/slots?service=<id>&duration=<minutes>&month=YYYY-MM-01 (a whole month)
 *                                              or &date=YYYY-MM-DD   (one day)
 * Returns free start times as "YYYY-MM-DDTHH:MM:SS" in salon time.
 */
export const onRequestGet = async ({ request, env }: { request: Request; env: BookingEnv }) => {
  const params = new URL(request.url).searchParams;
  const service = params.get("service") ?? "";
  const month = params.get("month") ?? "";
  const date = params.get("date") ?? "";
  const duration = params.get("duration") ? Math.round(Number(params.get("duration"))) : null;

  if (!UUID_PATTERN.test(service) || (!DATE_PATTERN.test(month) && !DATE_PATTERN.test(date))) {
    return json({ error: "Invalid request." }, 400);
  }
  if (duration !== null && (!Number.isFinite(duration) || duration < 1 || duration > 600)) {
    return json({ error: "Invalid duration." }, 400);
  }

  try {
    const sql = bookingSql(env);
    const rows = month
      ? await sql.query(
          `select to_char(appointment_start, 'YYYY-MM-DD"T"HH24:MI:SS') as start
           from get_available_slots_for_month($1, $2::date, $3)`,
          [service, month, duration],
        )
      : await sql.query(
          `select to_char(appointment_start, 'YYYY-MM-DD"T"HH24:MI:SS') as start
           from get_available_slots($1, $2::date, $3)`,
          [service, date, duration],
        );
    return json(rows.map((row) => row.start));
  } catch (error) {
    return serverError(error);
  }
};
