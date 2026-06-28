import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./src/lib/supabase/config";

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

    const { data: ownerUser } = await supabase
      .from("owner_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownerUser) return NextResponse.redirect(new URL("/", request.url));
    return response;
  }

  if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/appointments")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: ownerUser } = await supabase
      .from("owner_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ownerUser) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "not_owner");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/appointments/:path*", "/login"],
};
