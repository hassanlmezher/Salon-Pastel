import { getSupabaseConfig, isSupabaseConfigured } from "../../src/lib/supabase/config";

/**
 * Runs once a day. Free Supabase projects pause after a week without traffic,
 * which would take booking offline, so this makes one small read.
 */
export default async () => {
  if (!isSupabaseConfigured()) return new Response("Supabase is not configured.", { status: 500 });

  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/services?select=id&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  return new Response(response.ok ? "ok" : "failed", { status: response.ok ? 200 : 502 });
};

export const config = {
  schedule: "@daily",
};
