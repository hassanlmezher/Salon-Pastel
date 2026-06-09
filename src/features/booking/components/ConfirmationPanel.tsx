import { Check, Download, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { currency, dateTimeLabel } from "../../../lib/format";
import { services, staff } from "../data/catalogue";
import type { Booking } from "../types";

export function ConfirmationPanel({ booking }: { booking: Booking }) {
  const service = services.find((item) => item.id === booking.serviceId);
  const specialist = staff.find((item) => item.id === booking.staffId);

  return (
    <Card className="window-panel mx-auto max-w-4xl overflow-hidden p-0">
      <div className="action-panel p-7 text-center text-white sm:p-10">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10 text-white shadow-[0_18px_42px_rgba(47,106,82,0.18)]">
          <Check size={32} aria-hidden="true" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-soft">You are booked</p>
        <h1 className="mt-4 font-display text-[42px] leading-none text-white sm:text-[58px]">
          Your appointment is confirmed.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/78">
          Booking code <span className="font-semibold text-white">{booking.code}</span>. Your confirmation keeps the next actions practical: add to calendar, reschedule, or cancel.
        </p>
      </div>
      <div className="p-7 text-center sm:p-10">
        <div className="mt-0 grid gap-4 text-left sm:grid-cols-2">
          <Detail label="Service" value={service?.name ?? "Service"} />
          <Detail label="Specialist" value={specialist?.name ?? "Team member"} />
          <Detail label="Appointment" value={dateTimeLabel(booking.startIso, booking.timezone)} />
          <Detail label="Total" value={currency(booking.total)} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button">
            <span className="inline-flex items-center gap-2">
              <Download size={16} />
              Add to calendar
            </span>
          </Button>
          <Link to={`/manage/${booking.code}/reschedule`}>
            <Button type="button" variant="secondary">
              <span className="inline-flex items-center gap-2">
                <RotateCcw size={16} />
                Reschedule
              </span>
            </Button>
          </Link>
          <Link to={`/manage/${booking.code}/cancel`}>
            <Button type="button" variant="secondary">
              <span className="inline-flex items-center gap-2">
                <Trash2 size={16} />
                Cancel
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-stroke bg-surface-muted p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">{label}</p>
      <p className="mt-3 text-lg font-medium text-text">{value}</p>
    </div>
  );
}
