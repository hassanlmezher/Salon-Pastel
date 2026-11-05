export const ADMIN_URL = "https://pastel-salon-admin.pages.dev/";
const FROM_ADMIN_KEY = "pastel-from-admin";

/** The admin's "New appointment" button adds ?from=admin; remember it for this tab so the way back stays after switching tabs or services. */
export function readFromAdmin(searchParams?: URLSearchParams) {
  const flagged = searchParams?.get("from") === "admin";
  try {
    if (flagged) window.sessionStorage.setItem(FROM_ADMIN_KEY, "1");
    return window.sessionStorage.getItem(FROM_ADMIN_KEY) === "1";
  } catch {
    return flagged;
  }
}
