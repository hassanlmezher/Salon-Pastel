import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { RescheduleForm } from "./RescheduleForm";
import { StatusSelect } from "./StatusSelect";
import type { AdminAppointment, AppointmentStatus } from "../../src/features/admin/types";

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function formatDuration(minutes: number) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function addDays(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDayHeading(dateKey: string, today: string) {
  if (dateKey === today) return "Today";
  if (dateKey === addDays(today, 1)) return "Tomorrow";
  if (dateKey === addDays(today, -1)) return "Yesterday";

  const date = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(dateKey.slice(0, 4) !== today.slice(0, 4) ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export function formatReminderDay(dateKey: string, locale: string) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

/** wa.me needs the full international number as digits; customers type it in many shapes, and local ones are Lebanese. */
export function toWhatsAppNumber(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("961") && digits.length >= 10) return digits;
  return `961${digits.replace(/^0+/, "")}`;
}

function reminderLink(appointment: AdminAppointment) {
  const firstName = appointment.customerFullName.trim().split(/\s+/)[0] || "there";
  const services = appointment.selectedServices.map((item) => item.name).join(" + ") || "appointment";
  const time = appointment.appointmentTime;
  const day = formatReminderDay(appointment.dateKey, "en-GB");
  const dayAr = formatReminderDay(appointment.dateKey, "ar-LB-u-nu-latn");
  const when = [day && `on ${day}`, time && `at ${time}`].filter(Boolean).join(" ");
  const whenAr = [dayAr && `يوم ${dayAr}`, time && `الساعة ${time}`].filter(Boolean).join(" ");
  const message = [
    `Hi ${firstName}, this is a reminder from Pastel about your ${services} appointment${when ? ` ${when}` : ""}. See you soon!`,
    `مرحباً ${firstName}، نذكّركِ بموعدكِ في Pastel لـ ${services}${whenAr ? ` ${whenAr}` : ""}. نراكِ قريباً!`,
  ].join("\n\n");
  return `https://wa.me/${toWhatsAppNumber(appointment.customerPhone)}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function groupByDay(appointments: AdminAppointment[]) {
  const groups: { dateKey: string; appointments: AdminAppointment[] }[] = [];
  for (const appointment of appointments) {
    const last = groups[groups.length - 1];
    if (last?.dateKey === appointment.dateKey) last.appointments.push(appointment);
    else groups.push({ dateKey: appointment.dateKey, appointments: [appointment] });
  }
  return groups;
}

export function AppointmentList({
  appointments,
  today,
  onStatusSaved,
  onMoved,
}: {
  appointments: AdminAppointment[];
  today: string;
  onStatusSaved: (appointmentId: string, status: AppointmentStatus) => void;
  onMoved: (appointment: AdminAppointment, newStart: string) => void;
}) {
  const [movingId, setMovingId] = useState("");

  if (appointments.length === 0) {
    return (
      <section className="adminEmpty">
        <h2>No appointments</h2>
        <p>Try another day, status or search.</p>
      </section>
    );
  }

  return (
    <div className="adminList">
      {groupByDay(appointments).map((group) => (
        <section key={group.dateKey} aria-label={formatDayHeading(group.dateKey, today)}>
          <h2 className="adminDayHeading">{formatDayHeading(group.dateKey, today)}</h2>
          {group.appointments.map((appointment) => {
            const [service, ...addOns] = appointment.selectedServices.map((item) => item.name);
            const duration = formatDuration(appointment.totalDurationMinutes);

            return (
              <article className="adminCard" key={appointment.id} data-status={appointment.status}>
                <div className="adminCardTop">
                  <strong className="adminCardTime">{appointment.appointmentTime || "—"}</strong>
                  <StatusSelect appointmentId={appointment.id} status={appointment.status} onSaved={onStatusSaved} />
                </div>
                <h3>{appointment.customerFullName}</h3>
                {appointment.customerPhone ? (
                  <a
                    className="adminCardPhone"
                    href={reminderLink(appointment)}
                    target="_blank"
                    rel="noopener"
                    aria-label={`Send ${appointment.customerFullName} a WhatsApp reminder at ${appointment.customerPhone}`}
                  >
                    <WhatsAppIcon />
                    {appointment.customerPhone}
                  </a>
                ) : null}
                <p className="adminCardService">
                  {service || "Service not set"}
                  {addOns.length > 0 ? <span> + {addOns.join(" + ")}</span> : null}
                </p>
                <p className="adminCardMeta">
                  {formatMoney(appointment.totalPrice)}
                  {duration ? ` · ${duration}` : ""}
                </p>
                {appointment.status === "booked" || appointment.status === "confirmed" ? (
                  movingId === appointment.id ? (
                    <RescheduleForm
                      appointmentId={appointment.id}
                      currentStart={appointment.appointmentStart}
                      today={today}
                      onClose={() => setMovingId("")}
                      onMoved={(newStart) => {
                        setMovingId("");
                        onMoved(appointment, newStart);
                      }}
                    />
                  ) : (
                    <button type="button" className="adminMoveButton" onClick={() => setMovingId(appointment.id)}>
                      <CalendarClock size={18} strokeWidth={2} aria-hidden="true" />
                      Change date &amp; time
                    </button>
                  )
                ) : null}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
