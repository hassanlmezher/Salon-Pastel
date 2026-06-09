import { ArrowRight, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { currency, dateTimeLabel } from "../../../lib/format";
import { services, staff } from "../data/catalogue";
import type { Booking } from "../types";

export function ManageBookingView({ booking }: { booking: Booking }) {
  const service = services.find((item) => item.id === booking.serviceId);
  const specialist = staff.find((item) => item.id === booking.staffId);

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">Manage booking</p>
          <h1 className="mt-3 font-display text-[40px] leading-none text-text sm:text-[54px]">
            {booking.code}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-text-secondary">
            Review your appointment, then reschedule or cancel if you are still outside the change window.
          </p>
        </div>
        <div className="rounded-full border border-stroke bg-surface-muted px-4 py-2 text-sm text-text-secondary">
          Status: <span className="font-semibold text-text">{booking.status}</span>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Detail label="Service" value={service?.name ?? "Service"} />
        <Detail label="Specialist" value={specialist?.name ?? "Team member"} />
        <Detail label="Appointment" value={dateTimeLabel(booking.startIso, booking.timezone)} />
        <Detail label="Total" value={currency(booking.total)} />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to={`/manage/${booking.code}/reschedule`}>
          <Button type="button">
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
        <Link to="/book/service" className="sm:ml-auto">
          <Button type="button" variant="ghost">
            <span className="inline-flex items-center gap-2">
              Book another
              <ArrowRight size={16} />
            </span>
          </Button>
        </Link>
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
