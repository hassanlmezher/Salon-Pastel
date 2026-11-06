import { bookingSql, json, serverError, type BookingEnv } from "../../server/bookingDb";

/** GET /api/hours: the salon's weekly opening hours, set by the owner in the admin. */
export const onRequestGet = async ({ env }: { env: BookingEnv }) => {
  try {
    const [row] = await bookingSql(env).query("select get_opening_hours() as hours");
    // A change in the admin shows on the home page within a minute.
    return json(row?.hours ?? [], 200, { "Cache-Control": "public, max-age=60" });
  } catch (error) {
    return serverError(error);
  }
};
