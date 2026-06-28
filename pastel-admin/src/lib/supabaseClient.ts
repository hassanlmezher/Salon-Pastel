import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabase/config";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const { url, anonKey } = getSupabaseConfig();
    supabaseClient = createClient(url, anonKey);
  }

  return supabaseClient;
}
