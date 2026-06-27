function normalizeSupabaseUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();
  const parsedUrl = new URL(trimmedUrl);
  const projectRef = parsedUrl.pathname.match(/\/(?:dashboard\/)?project\/([^/]+)/)?.[1];

  if (projectRef && (parsedUrl.hostname === "supabase.com" || parsedUrl.hostname === "app.supabase.com")) {
    return `https://${projectRef}.supabase.co`;
  }

  if (parsedUrl.hostname.endsWith(".supabase.co")) {
    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  }

  return trimmedUrl.replace(/\/+$/, "");
}

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return {
    url: normalizeSupabaseUrl(supabaseUrl),
    anonKey: supabaseAnonKey.trim(),
  };
}
