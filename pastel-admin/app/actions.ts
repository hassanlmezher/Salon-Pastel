import {
  editableAppointmentStatuses,
  type EditableAppointmentStatus,
} from "../src/features/admin/types";
import { ApiError, adminApi, hasSignedInMarker } from "../src/lib/api";

function isEditableAppointmentStatus(value: string): value is EditableAppointmentStatus {
  return editableAppointmentStatuses.includes(value as EditableAppointmentStatus);
}

export type LoginErrorKey = "invalid" | "missing" | "locked" | "network";

/** Signs in as an owner. Returns an error key, or null when signed in. */
export async function loginOwner(formData: FormData): Promise<LoginErrorKey | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "missing";

  try {
    await adminApi("/api/login", { method: "POST", body: { email, password } });
    return null;
  } catch (error) {
    if (error instanceof ApiError && (error.code === "invalid" || error.code === "locked" || error.code === "missing")) {
      return error.code;
    }
    return "network";
  }
}

export async function logoutOwner() {
  await adminApi("/api/logout", { method: "POST" }).catch(() => undefined);
  window.location.replace("/login");
}

/** The signed-in owner's email, or null when signed out. */
export async function getSignedInEmail() {
  if (!hasSignedInMarker()) return null;
  try {
    const { email } = await adminApi<{ email: string | null }>("/api/session");
    return email;
  } catch {
    return null;
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  if (!appointmentId || !isEditableAppointmentStatus(status)) {
    return { ok: false, message: "Invalid appointment status." };
  }

  try {
    await adminApi(`/api/appointments/${appointmentId}/status`, { method: "POST", body: { status } });
    return { ok: true, message: "Status updated." };
  } catch (error) {
    console.error("Unable to update appointment status", error);
    return { ok: false, message: "Status could not be updated. Please try again." };
  }
}

/** Free start times ("YYYY-MM-DDTHH:MM:SS", salon time) on one day for moving this appointment. */
export async function getRescheduleSlots(appointmentId: string, date: string) {
  try {
    const slots = await adminApi<string[]>(`/api/appointments/${appointmentId}/slots?date=${encodeURIComponent(date)}`);
    return { ok: true as const, slots, message: "" };
  } catch (error) {
    console.error("Unable to load free times", error);
    return { ok: false as const, slots: [] as string[], message: "Free times could not be loaded. Please try again." };
  }
}

export async function rescheduleAppointment(appointmentId: string, appointmentStart: string) {
  try {
    await adminApi(`/api/appointments/${appointmentId}/reschedule`, { method: "POST", body: { start: appointmentStart } });
    return { ok: true, message: "" };
  } catch (error) {
    console.error("Unable to move appointment", error);
    const taken = error instanceof ApiError && /not free/i.test(error.code);
    return { ok: false, message: taken ? "That time was just taken. Please pick another one." : "The appointment could not be moved. Please try again." };
  }
}

/** One weekday (0 = Sunday); times are "HH:MM" in salon time, null on a closed day. */
export type OpeningDay = { day: number; open: boolean; opensAt: string | null; closesAt: string | null };

export async function getOpeningHours() {
  return adminApi<OpeningDay[]>("/api/hours");
}

export async function saveOpeningHours(hours: OpeningDay[]) {
  try {
    await adminApi("/api/hours", { method: "POST", body: { hours } });
    return { ok: true, message: "" };
  } catch (error) {
    console.error("Unable to save opening hours", error);
    if (error instanceof ApiError && error.status === 401) return { ok: false, message: "signed_out" };
    const message = error instanceof ApiError && /closing time/i.test(error.code)
      ? "Each closing time must be after the opening time."
      : "The opening hours could not be saved. Please try again.";
    return { ok: false, message };
  }
}
