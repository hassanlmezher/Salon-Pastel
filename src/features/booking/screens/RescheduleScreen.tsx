import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../components/EmptyState";
import { SkeletonState } from "../components/SkeletonState";
import { TimeSlotGrid } from "../components/TimeSlotGrid";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { bookingApi } from "../mocks/api";
import { getSuggestedDates } from "../logic/availability";
import type { AvailabilityResponse, Booking } from "../types";
import { addDays } from "date-fns";

export function RescheduleScreen() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);

  useEffect(() => {
    if (!code) return;
    bookingApi.getBooking(code).then((response) => {
      setBooking(response);
      setDate(response?.startIso.slice(0, 10) ?? null);
    });
  }, [code]);

  useEffect(() => {
    if (!booking || !date) return;
    bookingApi
      .getAvailability({
        serviceId: booking.serviceId,
        addOnIds: booking.addOnIds,
        staffId: booking.staffId,
        date,
        timezone: booking.timezone,
      })
      .then(setAvailability);
  }, [booking, date]);

  if (!booking) return <SkeletonState lines={6} />;

  const availableDates = Array.from({ length: 30 }, (_, index) =>
    addDays(new Date("2026-06-10T12:00:00"), index).toISOString().slice(0, 10),
  ).filter((dateIso) =>
    getSuggestedDates({
      serviceId: booking.serviceId,
      addOnIds: booking.addOnIds,
      staffId: booking.staffId,
      fromDateIso: dateIso,
    })[0] === dateIso,
  );

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">Reschedule</p>
        <h1 className="mt-3 font-display text-[42px] leading-none text-text">Choose a new appointment time</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-secondary">
          The appointment stays with the same specialist unless you go back and choose another option in the main booking flow.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <AvailabilityCalendar selectedDate={date} availableDates={availableDates} onSelectDate={setDate} />
        {availability ? (
          availability.slots.length > 0 ? (
            <TimeSlotGrid
              slots={availability.slots}
              selectedSlotIso={slot}
              onSelect={(selected) => setSlot(selected.startIso)}
            />
          ) : (
            <EmptyState title="No suitable times on this day" description="Choose another highlighted day to continue." />
          )
        ) : (
          <SkeletonState lines={6} />
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={!slot}
          onClick={async () => {
            if (!slot) return;
            await bookingApi.rescheduleBooking({
              code: booking.code,
              staffId: booking.staffId,
              startIso: slot,
            });
            navigate(`/manage/${booking.code}`);
          }}
        >
          Confirm new time
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(`/manage/${booking.code}`)}>
          Back to booking
        </Button>
      </div>
    </div>
  );
}
