import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../src/lib/supabaseClient";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("services").select("id").limit(1);

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
