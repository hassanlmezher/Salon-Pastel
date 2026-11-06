import { neon } from "@neondatabase/serverless";

/**
 * The admin's server code. It only runs for /api/*; every other path is served straight from the
 * static files in out/ without running this script. Each route is one call to a database function
 * that checks the session itself, so this file only handles cookies and request shapes.
 */

type Env = {
  /** Neon connection for the pastel_admin role, which may only run the admin_* functions. */
  DATABASE_URL: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
};

const SESSION_COOKIE = "pastel_admin_session";
const SIGNED_IN_COOKIE = "pastel_admin_signed_in";
const SESSION_DAYS = 30;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const START_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const STATUSES = ["booked", "confirmed", "cancelled"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function json(body: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * The session token (HttpOnly, scripts can't read it) plus a plain "signed in" marker that the
 * pages read to skip asking the server when nobody is signed in. The marker grants nothing.
 */
function sessionCookies(token: string, maxAgeSeconds: number) {
  return [
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`,
    `${SIGNED_IN_COOKIE}=${maxAgeSeconds ? "1" : ""}; Path=/; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`,
  ];
}

function readSessionToken(request: Request) {
  const cookies = request.headers.get("Cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([A-Za-z0-9_-]{20,})`));
  return match?.[1] ?? "";
}

/** Only a hash of the session token is stored, so a database leak can't be used to sign in. */
async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function isNotSignedIn(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "28000";
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("Content-Length") ?? 0) > 8_000) return null;
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function handleApi(request: Request, env: Env, url: URL) {
  // Changes must come from the admin's own pages (the session cookie is SameSite=Strict as well).
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    if (!origin || new URL(origin).host !== url.host) return json({ error: "Forbidden." }, 403);
  }

  const sql = neon(env.DATABASE_URL);
  const path = url.pathname;

  if (path === "/api/login" && request.method === "POST") {
    const body = await readJson(request);
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
    if (!email || !password) return json({ error: "missing" }, 400);

    const token = newToken();
    const [row] = await sql.query("select admin_login($1, $2, $3) as result", [email, password, await hashToken(token)]);
    if (row?.result === "ok") {
      return json({ ok: true }, 200, sessionCookies(token, SESSION_DAYS * 86_400));
    }
    return json({ error: row?.result === "locked" ? "locked" : "invalid" }, row?.result === "locked" ? 429 : 401);
  }

  const token = readSessionToken(request);
  const tokenHash = token ? await hashToken(token) : "";

  if (path === "/api/logout" && request.method === "POST") {
    if (tokenHash) await sql.query("select admin_logout($1)", [tokenHash]);
    return json({ ok: true }, 200, sessionCookies("", 0));
  }

  if (path === "/api/session" && request.method === "GET") {
    const [row] = tokenHash ? await sql.query("select admin_session_email($1) as email", [tokenHash]) : [];
    return json({ email: row?.email ?? null }, 200, row?.email ? [] : sessionCookies("", 0));
  }

  if (!tokenHash) return json({ error: "signed_out" }, 401, sessionCookies("", 0));

  try {
    if (path === "/api/appointments" && request.method === "GET") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const search = (url.searchParams.get("search") ?? "").slice(0, 100);
      if ((from && !DATE_PATTERN.test(from)) || (to && !DATE_PATTERN.test(to))) return json({ error: "Invalid dates." }, 400);
      const [row] = await sql.query("select admin_list_appointments($1, $2::timestamp, $3::timestamp, $4, $5) as list", [
        tokenHash,
        from,
        to,
        search,
        url.searchParams.get("newest") === "1",
      ]);
      return json(row?.list ?? []);
    }

    if (path === "/api/hours" && request.method === "GET") {
      const [row] = await sql.query("select admin_get_working_hours($1) as hours", [tokenHash]);
      return json(row?.hours ?? []);
    }

    if (path === "/api/hours" && request.method === "POST") {
      const body = await readJson(request);
      const days = Array.isArray(body?.hours) ? body.hours : [];
      const hours = days.map((item: Record<string, unknown>) => ({
        day: Number(item?.day),
        open: item?.open === true,
        opensAt: typeof item?.opensAt === "string" ? item.opensAt : null,
        closesAt: typeof item?.closesAt === "string" ? item.closesAt : null,
      }));
      const valid =
        hours.length === 7 &&
        new Set(hours.map((item: { day: number }) => item.day)).size === 7 &&
        hours.every((item: { day: number; open: boolean; opensAt: string | null; closesAt: string | null }) =>
          Number.isInteger(item.day) && item.day >= 0 && item.day <= 6 &&
          (!item.open || (TIME_PATTERN.test(item.opensAt ?? "") && TIME_PATTERN.test(item.closesAt ?? ""))),
        );
      if (!valid) return json({ error: "Invalid opening hours." }, 400);
      await sql.query("select admin_set_working_hours($1, $2::jsonb)", [tokenHash, JSON.stringify(hours)]);
      return json({ ok: true });
    }

    const match = path.match(/^\/api\/appointments\/([^/]+)\/(status|slots|reschedule)$/);
    if (!match || !UUID_PATTERN.test(match[1])) return json({ error: "Not found." }, 404);
    const [, appointmentId, action] = match;

    if (action === "slots" && request.method === "GET") {
      const date = url.searchParams.get("date") ?? "";
      if (!DATE_PATTERN.test(date)) return json({ error: "Invalid date." }, 400);
      const rows = await sql.query("select slot_start from admin_get_reschedule_slots($1, $2, $3::date)", [tokenHash, appointmentId, date]);
      return json(rows.map((row) => row.slot_start));
    }

    if (action === "status" && request.method === "POST") {
      const body = await readJson(request);
      const status = typeof body?.status === "string" ? body.status : "";
      if (!STATUSES.includes(status)) return json({ error: "Invalid appointment status." }, 400);
      await sql.query("select admin_update_appointment_status($1, $2, $3)", [tokenHash, appointmentId, status]);
      return json({ ok: true });
    }

    if (action === "reschedule" && request.method === "POST") {
      const body = await readJson(request);
      const start = typeof body?.start === "string" ? body.start : "";
      if (!START_PATTERN.test(start)) return json({ error: "Invalid time." }, 400);
      await sql.query("select admin_reschedule_appointment($1, $2, $3::timestamp)", [tokenHash, appointmentId, start]);
      return json({ ok: true });
    }

    return json({ error: "Not found." }, 404);
  } catch (error) {
    if (isNotSignedIn(error)) return json({ error: "signed_out" }, 401, sessionCookies("", 0));
    const message = error instanceof Error ? error.message : "";
    if (/not free|can be moved|not found|invalid appointment status|opening hours|closing time/i.test(message)) return json({ error: message }, 409);
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      return await handleApi(request, env, url);
    } catch (error) {
      console.error(error);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};
