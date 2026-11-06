import { json } from "../../server/bookingDb";

/** Any other /api address is a mistake, not a page, so it gets a plain 404 instead of the app. */
export const onRequest = () => json({ error: "Not found." }, 404);
