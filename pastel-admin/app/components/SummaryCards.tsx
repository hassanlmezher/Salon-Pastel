import { CheckCircle2, Clock3, Scissors, XCircle } from "lucide-react";
import type { AdminAppointment } from "../../src/features/admin/types";

export function SummaryCards({ appointments }: { appointments: AdminAppointment[] }) {
  const booked = appointments.filter((appointment) => appointment.status === "booked").length;
  const confirmed = appointments.filter((appointment) => appointment.status === "confirmed").length;
  const completed = appointments.filter((appointment) => appointment.status === "completed").length;
  const cancelled = appointments.filter((appointment) => appointment.status === "cancelled" || appointment.status === "no_show").length;

  const cards = [
    { label: "Visible bookings", value: appointments.length, icon: Scissors },
    { label: "Booked", value: booked, icon: Clock3 },
    { label: "Confirmed", value: confirmed, icon: CheckCircle2 },
    { label: "Cancelled or no-show", value: cancelled, icon: XCircle },
  ];

  return (
    <section className="summaryGrid" aria-label="Appointment summary">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="summaryCard">
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        );
      })}
    </section>
  );
}
