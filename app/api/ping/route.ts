import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../src/lib/supabaseClient";

const PING_TIMEOUT_MS = 8000;

async function withPingTimeout<T>(query: (signal: AbortSignal) => T): Promise<Awaited<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    return await query(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = getSupabaseClient();
    const { error } = await withPingTimeout((signal) =>
      supabase.from("services").select("id").limit(1).abortSignal(signal),
    );

    if (error) {
      return NextResponse.json({
        success: false,
        timestamp,
        supabase: "error",
      });
    }

    return NextResponse.json({
      success: true,
      timestamp,
      supabase: "connected",
    });
  } catch {
    return NextResponse.json({
      success: false,
      timestamp,
      supabase: "error",
    });
  }
}
