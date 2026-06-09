import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { bookingApi } from "../mocks/api";
import { BookingLayout } from "../components/BookingLayout";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { EmptyState } from "../components/EmptyState";
import { SkeletonState } from "../components/SkeletonState";
import { TimeSlotGrid } from "../components/TimeSlotGrid";
import { useBooking } from "../context/BookingContext";
import { getSuggestedDates } from "../logic/availability";
import { Button } from "../../../components/ui/Button";
import { shortDate } from "../../../lib/format";
import { addDays } from "date-fns";

export function ScheduleStepScreen() {
  const navigate = useNavigate();
  const { draft, updateDraft, quote, staff } = useBooking();
  const [availability, setAvailability] = useState<Awaited<ReturnType<typeof bookingApi.getAvailability>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  const availableDates = Array.from({ length: 35 }, (_, index) =>
    addDays(new Date("2026-06-10T12:00:00"), index).toISOString().slice(0, 10),
  ).filter((dateIso) =>
    getSuggestedDates({
      serviceId: draft.serviceId ?? "",
      addOnIds: draft.addOnIds,
      staffId: draft.staffId,
      fromDateIso: dateIso,
    })[0] === dateIso,
  );

  useEffect(() => {
    if (!draft.serviceId || !draft.selectedDate) return;
    let active = true;
    setLoading(true);
    setError(null);

    bookingApi
      .getAvailability({
        serviceId: draft.serviceId,
        addOnIds: draft.addOnIds,
        staffId: draft.staffId,
        date: draft.selectedDate,
        timezone: "Europe/London",
      })
      .then((response) => {
        if (!active) return;
        setAvailability(response);
        if (
          draft.selectedSlotIso &&
          !response.slots.some((slot) => slot.startIso === draft.selectedSlotIso)
        ) {
          updateDraft((current) => ({ ...current, selectedSlotIso: null }));
          setSlotNotice("Your previous time no longer fits this duration. We cleared it and suggested the nearest alternatives.");
        } else {
          setSlotNotice(null);
        }
      })
      .catch((responseError) => {
        if (!active) return;
        setError(responseError instanceof Error ? responseError.message : "Availability could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [draft.serviceId, draft.addOnIds, draft.staffId, draft.selectedDate, draft.selectedSlotIso, updateDraft]);

  if (!draft.serviceId) {
    return <Navigate to="/book/service" replace />;
  }

  return (
    <BookingLayout
      step="schedule"
      title="Choose a day and time"
      description="Date and time live together here so the flow feels shorter and more operationally realistic on mobile."
      timezone="Europe/London"
      ctaLabel="Continue to review"
      ctaDisabled={!draft.selectedSlotIso}
      onCta={() => navigate("/book/review")}
      backTo="/book/service"
      mobileTitle={draft.selectedDate ? shortDate(draft.selectedDate) : "Choose a day"}
      mobileSubtitle={draft.selectedSlotIso ? `Duration ${quote.durationMin} min selected.` : "Pick a day to reveal times."}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <AvailabilityCalendar
          selectedDate={draft.selectedDate}
          availableDates={availableDates}
          onSelectDate={(selectedDate) =>
            updateDraft((current) => ({
              ...current,
              selectedDate,
              selectedSlotIso: null,
            }))
          }
        />

        <div className="space-y-4">
          {slotNotice ? (
            <div className="rounded-[24px] border border-gold-soft/40 bg-gold-soft/10 p-4 text-sm text-text-secondary">
              {slotNotice}
            </div>
          ) : null}
          {error ? (
            <EmptyState
              title="Availability could not be loaded"
              description={error}
              action={
                <Button
                  type="button"
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      selectedDate: current.selectedDate,
                    }))
                  }
                >
                  Retry
                </Button>
              }
            />
          ) : loading ? (
            <SkeletonState lines={6} />
          ) : availability && availability.slots.length > 0 ? (
            <TimeSlotGrid
              slots={availability.slots}
              selectedSlotIso={draft.selectedSlotIso}
              onSelect={(slot) =>
                updateDraft((current) => ({
                  ...current,
                  selectedSlotIso: slot.startIso,
                  staffId: current.staffId ?? slot.staffId,
                }))
              }
            />
          ) : (
            <EmptyState
              title="No suitable times on this day"
              description="Here are the next available options based on your service length and staff preference."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {(availability?.nearbyDates ?? []).map((dateIso) => (
                    <Button
                      key={dateIso}
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        updateDraft((current) => ({
                          ...current,
                          selectedDate: dateIso,
                          selectedSlotIso: null,
                        }))
                      }
                    >
                      {shortDate(dateIso)}
                    </Button>
                  ))}
                </div>
              }
            />
          )}

          {draft.staffId && availability?.slots.length === 0 && availability.alternativeStaffIds.length > 0 ? (
            <div className="rounded-[24px] border border-stroke bg-surface p-4 text-sm leading-7 text-text-secondary">
              Your chosen specialist is unavailable for this duration on the selected day. Try Any available or another specialist from the previous step.
            </div>
          ) : null}

          {staff.length === 0 ? (
            <div className="rounded-[24px] border border-error/20 bg-error/5 p-4 text-sm leading-7 text-text-secondary">
              No team member supports this exact combination yet. Remove one add-on or choose a different service.
            </div>
          ) : null}
        </div>
      </div>
    </BookingLayout>
  );
}
