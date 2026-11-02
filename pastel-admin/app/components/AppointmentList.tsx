import { Phone } from "lucide-react";
import { StatusSelect } from "./StatusSelect";
import type { AdminAppointment } from "../../src/features/admin/types";

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

function groupByDay(appointments: AdminAppointment[]) {
  const groups: { dateKey: string; appointments: AdminAppointment[] }[] = [];
  for (const appointment of appointments) {
    const last = groups[groups.length - 1];
    if (last?.dateKey === appointment.dateKey) last.appointments.push(appointment);
    else groups.push({ dateKey: appointment.dateKey, appointments: [appointment] });
  }
  return groups;
}

export function AppointmentList({ appointments, today }: { appointments: AdminAppointment[]; today: string }) {
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
                  <StatusSelect appointmentId={appointment.id} status={appointment.status} />
                </div>
                <h3>{appointment.customerFullName}</h3>
                {appointment.customerPhone ? (
                  <a className="adminCardPhone" href={`tel:${appointment.customerPhone.replace(/[^\d+]/g, "")}`}>
                    <Phone size={16} strokeWidth={2} aria-hidden="true" />
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
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
