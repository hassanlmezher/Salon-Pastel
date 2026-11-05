"use client";

import { useEffect, useState } from "react";
import { getRescheduleSlots, rescheduleAppointment } from "../actions";

export function formatSlotTime(slot: string) {
  const match = slot.match(/T(\d{2}):(\d{2})/);
  if (!match) return slot;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

/** Pick a new day and one of its free times, then move the appointment there. */
export function RescheduleForm({
  appointmentId,
  currentStart,
  today,
  onMoved,
  onClose,
}: {
  appointmentId: string;
  /** Current start, "YYYY-MM-DDTHH:MM", salon time. */
  currentStart: string;
  today: string;
  onMoved: (newStart: string) => void;
  onClose: () => void;
}) {
  const currentDay = currentStart.slice(0, 10);
  const [day, setDay] = useState(currentDay >= today ? currentDay : today);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setSelected("");
    setMessage("");
    getRescheduleSlots(appointmentId, day).then((result) => {
      if (cancelled) return;
      setSlots(result.slots);
      if (!result.ok) setMessage(result.message);
    });
    return () => {
      cancelled = true;
    };
  }, [appointmentId, day]);

  const isCurrent = (slot: string) => slot.slice(0, 16) === currentStart.slice(0, 16);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const result = await rescheduleAppointment(appointmentId, selected);
    setSaving(false);
    if (result.ok) onMoved(selected);
    else {
      setMessage(result.message);
      // Refresh the times so the one that was just taken disappears.
      getRescheduleSlots(appointmentId, day).then((fresh) => setSlots(fresh.slots));
      setSelected("");
    }
  }

  return (
    <div className="adminReschedule">
      <label className="adminRescheduleDay">
        <span>New day</span>
        <input type="date" value={day} min={today} required onChange={(event) => event.target.value && setDay(event.target.value)} />
      </label>

      <fieldset className="adminRescheduleTimes" aria-busy={slots === null}>
        <legend>Free times</legend>
        {slots === null ? (
          <p className="adminRescheduleNote">Loading free times…</p>
        ) : slots.length === 0 && !message ? (
          <p className="adminRescheduleNote">No free times on this day. The salon may be closed or fully booked, so try another day.</p>
        ) : (
          <div className="adminRescheduleGrid">
            {slots.map((slot) => {
              const current = isCurrent(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  className={selected === slot ? "active" : ""}
                  aria-pressed={selected === slot}
                  disabled={current || saving}
                  onClick={() => setSelected(slot)}
                >
                  {formatSlotTime(slot)}
                  {current ? <small>Now</small> : null}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {message ? (
        <p className="adminRescheduleError" role="alert">
          {message}
        </p>
      ) : null}

      <div className="adminRescheduleActions">
        <button type="button" className="adminRescheduleSave" disabled={!selected || saving} onClick={save}>
          {saving ? "Moving…" : selected ? `Move to ${formatSlotTime(selected)}` : "Pick a time"}
        </button>
        <button type="button" className="adminRescheduleCancel" disabled={saving} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
