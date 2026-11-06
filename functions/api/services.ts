import { bookingSql, json, serverError, type BookingEnv } from "../../server/bookingDb";

/** GET /api/services: active services with their category name. */
export const onRequestGet = async ({ env }: { env: BookingEnv }) => {
  try {
    const rows = await bookingSql(env).query("select id, name, price, duration_minutes, category from list_active_services()");
    // Services change rarely, so browsers and Cloudflare may reuse the list for a minute.
    return json(rows, 200, { "Cache-Control": "public, max-age=60" });
  } catch (error) {
    return serverError(error);
  }
};
