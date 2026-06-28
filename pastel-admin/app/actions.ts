"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appointmentStatuses, type AppointmentStatus } from "../src/features/admin/types";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

const ADMIN_ACTION_TIMEOUT_MS = 8000;

async function withAdminActionTimeout<T>(query: (signal: AbortSignal) => T): Promise<Awaited<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_ACTION_TIMEOUT_MS);

  try {
    return await query(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return appointmentStatuses.includes(value as AppointmentStatus);
}

export async function loginOwner(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=missing");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) redirect("/login?error=invalid");

  const { data: ownerUser } = await withAdminActionTimeout((signal) =>
    supabase
      .from("owner_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .abortSignal(signal)
      .maybeSingle(),
  );

  if (!ownerUser) {
    await supabase.auth.signOut();
    redirect("/login?error=not_owner");
  }

  redirect("/");
}

export async function logoutOwner() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  if (!appointmentId || !isAppointmentStatus(status)) {
    return { ok: false, message: "Invalid appointment status." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await withAdminActionTimeout((signal) =>
    supabase
      .rpc("admin_update_appointment_status", {
        p_appointment_id: appointmentId,
        p_status: status,
      })
      .abortSignal(signal),
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/appointments");
  return { ok: true, message: "Status updated." };
}
