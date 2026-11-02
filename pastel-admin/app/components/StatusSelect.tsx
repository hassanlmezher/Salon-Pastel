"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "../actions";
import {
  editableAppointmentStatuses,
  type AppointmentStatus,
  type EditableAppointmentStatus,
} from "../../src/features/admin/types";

export function StatusSelect({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const [selectedStatus, setSelectedStatus] = useState<EditableAppointmentStatus>(
    status === "confirmed" || status === "cancelled" ? status : "booked",
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const labels: Record<EditableAppointmentStatus, string> = {
    booked: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  };

  if (status === "completed") {
    return <span className="adminStatusDone">Done</span>;
  }

  return (
    <div className="adminStatus" data-status={selectedStatus}>
      <select
        value={selectedStatus}
        disabled={isPending}
        aria-label="Update appointment status"
        onChange={(event) => {
          const nextStatus = event.target.value as EditableAppointmentStatus;
          const previousStatus = selectedStatus;
          setSelectedStatus(nextStatus);
          setMessage("");
          startTransition(async () => {
            const result = await updateAppointmentStatus(appointmentId, nextStatus);
            if (!result.ok) {
              setSelectedStatus(previousStatus);
              setMessage(result.message);
              return;
            }

            setMessage("Status updated");
          });
        }}
      >
        {editableAppointmentStatuses.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
      <span className={message && message !== "Status updated" ? "adminStatusError" : "srOnly"} aria-live="polite">
        {isPending ? "Saving…" : message}
      </span>
    </div>
  );
}
