import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../src/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json). Free Supabase projects
 * pause after a week without traffic, which would take booking offline.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("services").select("id").limit(1);

  return NextResponse.json({ ok: !error }, { status: error ? 502 : 200 });
}
