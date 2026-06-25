import { getSupabaseClient } from "../../../lib/supabaseClient";

export type ReminderSubscriptionInput = {
  appointmentId: string;
  customerPhone: string;
};

export type ReminderSubscriptionResult =
  | { status: "subscribed" }
  | { status: "unsupported"; message: string }
  | { status: "denied"; message: string }
  | { status: "not-configured"; message: string }
  | { status: "error"; message: string };

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export async function requestAppointmentReminderSubscription({
  appointmentId,
  customerPhone,
}: ReminderSubscriptionInput): Promise<ReminderSubscriptionResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return {
      status: "unsupported",
      message: "This browser does not support appointment reminders.",
    };
  }

  // iOS supports Web Push only for supported iOS versions when the PWA is installed
  // on the Home Screen. Safari browser tabs cannot receive push notifications.
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  if (isiOS && !standalone) {
    return {
      status: "unsupported",
      message: "On iPhone, install Pastel to your Home Screen first, then enable reminders from the app.",
    };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return {
      status: "not-configured",
      message: "Reminder notifications are prepared, but the push key is not configured yet.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      status: "denied",
      message: "Notification permission was not granted.",
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        appointment_id: appointmentId,
        customer_phone: customerPhone,
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        user_agent: window.navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (error) throw error;

    return { status: "subscribed" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not enable appointment reminders.",
    };
  }
}
