import { neon } from "@neondatabase/serverless";

/** Cloudflare Pages settings for the booking site's server routes. */
export type BookingEnv = {
  /** Neon connection for the pastel_booking role, which may only list services, read free times and book. */
  DATABASE_URL: string;
};

export function bookingSql(env: BookingEnv) {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  return neon(env.DATABASE_URL);
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Logs the real error for the dashboard and gives the visitor a plain one. */
export function serverError(error: unknown) {
  console.error(error);
  return json({ error: "Something went wrong. Please try again." }, 500);
}
