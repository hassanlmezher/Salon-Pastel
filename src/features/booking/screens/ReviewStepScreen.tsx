import { Link, Navigate, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { BookingLayout } from "../components/BookingLayout";
import { BookingSummaryCard } from "../components/BookingSummaryCard";
import { PolicyNotice } from "../components/PolicyNotice";
import { ReviewForm } from "../components/ReviewForm";
import { useBooking } from "../context/BookingContext";
import { bookingApi } from "../mocks/api";
import { addOns, services, staff } from "../data/catalogue";
import { Chip } from "../../../components/ui/Chip";
import { currency, dateTimeLabel } from "../../../lib/format";

export function ReviewStepScreen() {
  const navigate = useNavigate();
  const { draft, quote, setGuestFields, setConfirmedBooking } = useBooking();
  const [submitting, setSubmitting] = useState(false);

  const service = services.find((item) => item.id === draft.serviceId) ?? null;
  const selectedAddOns = addOns.filter((item) => draft.addOnIds.includes(item.id));
  const specialist = draft.staffId ? staff.find((item) => item.id === draft.staffId) ?? null : null;

  if (!draft.serviceId || !draft.selectedDate || !draft.selectedSlotIso) {
    return <Navigate to="/book/schedule" replace />;
  }

  return (
    <BookingLayout
      step="review"
      title="Review and confirm"
      description="Keep the form minimal, keep the summary explicit, and make the final decision easy to trust."
      timezone="Europe/London"
      ctaLabel="Scroll to confirmation"
      onCta={() => {
        const node = document.getElementById("review-form");
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      backTo="/book/schedule"
      mobileTitle="Review booking"
      mobileSubtitle={service?.name ?? "Complete your details"}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="window-panel p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">Booking details</p>
              <h2 className="mt-3 font-display text-[34px] leading-none text-text">Everything in one place</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/book/service">
                <Chip className="gap-2">
                  <Pencil size={12} />
                  Edit service
                </Chip>
              </Link>
              <Link to="/book/schedule">
                <Chip className="gap-2">
                  <Pencil size={12} />
                  Edit time
                </Chip>
              </Link>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Fact label="Service" value={service?.name ?? ""} />
            <Fact label="Staff" value={specialist?.name ?? "Any available"} />
            <Fact label="Appointment" value={dateTimeLabel(draft.selectedSlotIso, "Europe/London")} />
            <Fact label="Timezone" value="Europe/London" />
            <Fact label="Duration" value={`${quote.durationMin} min`} />
            <Fact label="Total" value={currency(quote.total)} />
          </dl>
          {selectedAddOns.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-text">Add-ons</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedAddOns.map((item) => (
                  <Chip key={item.id}>{item.name}</Chip>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6">
            <PolicyNotice />
          </div>
        </Card>

        <div className="space-y-5" id="review-form">
          <BookingSummaryCard draft={draft} quote={quote} timezone="Europe/London" />
          <Card className="window-panel p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">Guest booking</p>
            <h2 className="mt-3 font-display text-[34px] leading-none text-text">Final details</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              We only ask for the details needed to reserve and manage this appointment.
            </p>
            <div className="mt-6">
              <ReviewForm
                guest={draft.guest}
                onChange={setGuestFields}
                submitting={submitting}
                onSubmit={async () => {
                  setSubmitting(true);
                  const booking = await bookingApi.createBooking({
                    serviceId: draft.serviceId!,
                    addOnIds: draft.addOnIds,
                    staffId: draft.staffId ?? specialist?.id ?? "",
                    startIso: draft.selectedSlotIso!,
                    guest: draft.guest,
                  });
                  setConfirmedBooking(booking);
                  setSubmitting(false);
                  navigate(`/book/success/${booking.code}`);
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </BookingLayout>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-stroke bg-surface-muted p-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
