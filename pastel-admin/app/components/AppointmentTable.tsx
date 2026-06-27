import { StatusSelect } from "./StatusSelect";
import type { AdminAppointment } from "../../src/features/admin/types";

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function formatDuration(minutes: number) {
  if (!minutes) return "Not set";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

export function AppointmentTable({ appointments }: { appointments: AdminAppointment[] }) {
  if (appointments.length === 0) {
    return (
      <section className="emptyState">
        <h2>No appointments found</h2>
        <p>Try a different date, status, or search term.</p>
      </section>
    );
  }

  return (
    <section className="tableCard" aria-label="Appointments">
      <div className="tableScroller">
        <table className="appointmentTable">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Services</th>
              <th>Date</th>
              <th>Time</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  <strong>{appointment.customerFirstName || "Unknown"}</strong>
                  <span>{appointment.customerLastName}</span>
                </td>
                <td>{appointment.customerPhone || "Not provided"}</td>
                <td>
                  <div className="serviceList">
                    {appointment.selectedServices.length > 0
                      ? appointment.selectedServices.map((service, index) => (
                          <span key={`${appointment.id}-${service.name}-${index}`}>{service.name}</span>
                        ))
                      : "Not set"}
                  </div>
                </td>
                <td>{appointment.appointmentDate || "Not set"}</td>
                <td>{appointment.appointmentTime || "Not set"}</td>
                <td>
                  <strong>{formatMoney(appointment.totalPrice)}</strong>
                  <span>{formatDuration(appointment.totalDurationMinutes)}</span>
                </td>
                <td>
                  <StatusSelect appointmentId={appointment.id} status={appointment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
