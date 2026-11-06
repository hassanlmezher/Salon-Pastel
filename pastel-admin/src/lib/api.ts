const API_TIMEOUT_MS = 10_000;

/** Set by the server next to the real (HttpOnly) session cookie; missing means nobody is signed in here. */
export function hasSignedInMarker() {
  return typeof document !== "undefined" && /(?:^|;\s*)pastel_admin_signed_in=1/.test(document.cookie);
}

/** A non-OK answer from the admin's /api routes; `code` is the route's short error text. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

/**
 * Calls the admin's own /api routes with the session cookie. The first call after a quiet spell
 * can wake the database, so it gets 10 seconds before giving up.
 */
export async function adminApi<T>(path: string, init: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: "same-origin",
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, typeof body?.error === "string" ? body.error : "error");
    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
