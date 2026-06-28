import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./src/lib/supabase/config";

const MIDDLEWARE_QUERY_TIMEOUT_MS = 8000;

async function withMiddlewareQueryTimeout<T>(query: (signal: AbortSignal) => T): Promise<Awaited<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MIDDLEWARE_QUERY_TIMEOUT_MS);

  try {
    return await query(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/login") {
    if (!user) return response;

    const { data: ownerUser } = await withMiddlewareQueryTimeout((signal) =>
      supabase
        .from("owner_users")
        .select("user_id")
        .eq("user_id", user.id)
        .abortSignal(signal)
        .maybeSingle(),
    );

    if (ownerUser) return NextResponse.redirect(new URL("/", request.url));
    return response;
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/book")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: ownerUser } = await withMiddlewareQueryTimeout((signal) =>
      supabase
        .from("owner_users")
        .select("user_id")
        .eq("user_id", user.id)
        .abortSignal(signal)
        .maybeSingle(),
    );

    if (!ownerUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "not_owner");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/appointments/:path*", "/book/:path*", "/login"],
};
