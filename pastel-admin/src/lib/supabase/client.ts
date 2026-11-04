import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient | null = null;

/** One browser client for the whole admin; the session is kept in localStorage. */
export function getSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseConfig();
    client = createClient(url, anonKey);
  }

  return client;
}
