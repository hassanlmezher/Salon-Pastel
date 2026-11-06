import { UUID_PATTERN, bookingSql, json, serverError, type BookingEnv } from "../../server/bookingDb";

type SelectedService = {
  id?: string | null;
  slug?: string | null;
  kind?: string;
  name: string;
  price?: number | string | null;
  duration_minutes?: number | null;
};

type BookingRequest = {
  serviceId?: unknown;
  customerFullName?: unknown;
  customerFirstName?: unknown;
  customerLastName?: unknown;
  customerPhone?: unknown;
  appointmentStart?: unknown;
  selectedServices?: unknown;
  totalPrice?: unknown;
  totalDurationMinutes?: unknown;
};

const START_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** POST /api/appointments: books one appointment. The database re-checks the time is still free. */
export const onRequestPost = async ({ request, env }: { request: Request; env: BookingEnv }) => {
  if (Number(request.headers.get("Content-Length") ?? 0) > 16_000) {
    return json({ error: "Request is too large." }, 413);
  }

  let body: BookingRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const serviceId = text(body.serviceId, 36);
  const fullName = text(body.customerFullName, 120);
  const phone = text(body.customerPhone, 30);
  const start = text(body.appointmentStart, 19);
  if (!UUID_PATTERN.test(serviceId) || !fullName || !phone || !START_PATTERN.test(start)) {
    return json({ error: "Please enter your name, phone number and a time." }, 400);
  }

  const selected = Array.isArray(body.selectedServices)
    ? (body.selectedServices as SelectedService[]).slice(0, 12).map((item) => ({
        id: typeof item?.id === "string" ? item.id.slice(0, 36) : null,
        slug: typeof item?.slug === "string" ? item.slug.slice(0, 80) : null,
        kind: item?.kind === "add_on" ? "add_on" : "service",
        name: text(item?.name, 120),
        price: typeof item?.price === "number" || typeof item?.price === "string" ? item.price : null,
        duration_minutes: optionalNumber(item?.duration_minutes),
      }))
    : null;

  try {
    const rows = await bookingSql(env).query(
      "select create_appointment($1, $2, $3, $4::timestamp, $5, $6, $7::jsonb, $8, $9) as id",
      [
        serviceId,
        fullName,
        phone,
        start,
        text(body.customerFirstName, 60) || null,
        text(body.customerLastName, 60) || null,
        selected ? JSON.stringify(selected) : null,
        optionalNumber(body.totalPrice),
        optionalNumber(body.totalDurationMinutes),
      ],
    );
    return json({ id: rows[0]?.id }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // Messages raised by create_appointment are written for customers, so they are passed on.
    if (/just booked|not available|required/i.test(message)) {
      return json({ error: message }, 409);
    }
    return serverError(error);
  }
};
