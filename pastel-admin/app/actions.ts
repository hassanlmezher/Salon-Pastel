import {
  editableAppointmentStatuses,
  type EditableAppointmentStatus,
} from "../src/features/admin/types";
import { getSupabaseClient } from "../src/lib/supabase/client";
import { isSupabaseConfigured } from "../src/lib/supabase/config";

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

function isEditableAppointmentStatus(value: string): value is EditableAppointmentStatus {
  return editableAppointmentStatuses.includes(value as EditableAppointmentStatus);
}

export type LoginErrorKey = "invalid" | "missing" | "not_owner" | "not_configured" | "network";

/** Signs in and checks the owner list. Returns an error key, or null when signed in as an owner. */
export async function loginOwner(formData: FormData): Promise<LoginErrorKey | null> {
  if (!isSupabaseConfigured()) return "not_configured";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "missing";

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return error.status === 400 ? "invalid" : "network";
  if (!data.user) return "invalid";

  const { data: ownerUser, error: ownerError } = await withAdminActionTimeout((signal) =>
    supabase
      .from("owner_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .abortSignal(signal)
      .maybeSingle(),
  );

  if (ownerError) return "network";
  if (!ownerUser) {
    await supabase.auth.signOut();
    return "not_owner";
  }

  return null;
}

export async function logoutOwner() {
  await getSupabaseClient().auth.signOut();
  window.location.replace("/login");
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  if (!appointmentId || !isEditableAppointmentStatus(status)) {
    return { ok: false, message: "Invalid appointment status." };
  }

  const { error } = await withAdminActionTimeout((signal) =>
    getSupabaseClient()
      .rpc("admin_update_appointment_status", {
        p_appointment_id: appointmentId,
        p_status: status,
      })
      .abortSignal(signal),
  );

  if (error) {
    console.error("Unable to update appointment status", error);
    return { ok: false, message: "Status could not be updated. Please try again." };
  }

  return { ok: true, message: "Status updated." };
}

/** Free start times ("YYYY-MM-DDTHH:MM:SS", salon time) on one day for moving this appointment. */
export async function getRescheduleSlots(appointmentId: string, date: string) {
  const { data, error } = await withAdminActionTimeout((signal) =>
    getSupabaseClient()
      .rpc("admin_get_reschedule_slots", { p_appointment_id: appointmentId, p_date: date })
      .abortSignal(signal),
  );

  if (error) {
    console.error("Unable to load free times", error);
    return { ok: false as const, slots: [] as string[], message: "Free times could not be loaded. Please try again." };
  }

  const slots = ((data ?? []) as { slot_start: string }[]).map((row) => row.slot_start);
  return { ok: true as const, slots, message: "" };
}

export async function rescheduleAppointment(appointmentId: string, appointmentStart: string) {
  const { error } = await withAdminActionTimeout((signal) =>
    getSupabaseClient()
      .rpc("admin_reschedule_appointment", { p_appointment_id: appointmentId, p_appointment_start: appointmentStart })
      .abortSignal(signal),
  );

  if (error) {
    console.error("Unable to move appointment", error);
    const taken = /not free/i.test(error.message ?? "");
    return { ok: false, message: taken ? "That time was just taken. Please pick another one." : "The appointment could not be moved. Please try again." };
  }

  return { ok: true, message: "" };
}
