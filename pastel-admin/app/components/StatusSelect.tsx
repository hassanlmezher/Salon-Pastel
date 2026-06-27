"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "../actions";
import { appointmentStatuses, type AppointmentStatus } from "../../src/features/admin/types";

export function StatusSelect({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="statusControl">
      <select
        value={selectedStatus}
        disabled={isPending}
        aria-label="Update appointment status"
        onChange={(event) => {
          const nextStatus = event.target.value as AppointmentStatus;
          setSelectedStatus(nextStatus);
          setMessage("");
          startTransition(async () => {
            const result = await updateAppointmentStatus(appointmentId, nextStatus);
            if (!result.ok) {
              setSelectedStatus(status);
              setMessage(result.message);
              return;
            }

            setMessage("Saved");
          });
        }}
      >
        {appointmentStatuses.map((option) => (
          <option key={option} value={option}>
            {option.replace("_", " ")}
          </option>
        ))}
      </select>
      <span className={message === "Saved" ? "statusSaved" : "statusError"} aria-live="polite">
        {isPending ? "Saving..." : message}
      </span>
    </div>
  );
}
