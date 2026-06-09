import { createContext, useContext, useEffect, useState } from "react";
import { bookingApi } from "../mocks/api";
import { defaultDraft } from "../mocks/storage";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import { createQuote } from "../logic/quote";
import type { Booking, DraftBooking, Quote, Staff } from "../types";

type BookingContextValue = {
  draft: DraftBooking;
  quote: Quote;
  staff: Staff[];
  staffLoading: boolean;
  updateDraft: (updater: (current: DraftBooking) => DraftBooking) => void;
  resetDraft: () => void;
  setGuestFields: (guest: DraftBooking["guest"]) => void;
  confirmedBooking: Booking | null;
  setConfirmedBooking: (booking: Booking | null) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { draft, setDraft, resetDraft } = usePersistedDraft();
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    if (!draft.serviceId) {
      setStaff([]);
      return;
    }

    let active = true;
    setStaffLoading(true);

    bookingApi
      .getStaff({
        serviceId: draft.serviceId,
        addOnIds: draft.addOnIds,
      })
      .then((response) => {
        if (!active) return;
        setStaff(response);
        if (draft.staffId && !response.some((item) => item.id === draft.staffId)) {
          setDraft((current) => ({
            ...current,
            staffId: null,
            selectedSlotIso: null,
          }));
        }
      })
      .finally(() => {
        if (active) setStaffLoading(false);
      });

    return () => {
      active = false;
    };
  }, [draft.serviceId, draft.addOnIds, draft.staffId, setDraft]);

  const updateDraft = (updater: (current: DraftBooking) => DraftBooking) => {
    setDraft((current) => updater(current));
  };

  const setGuestFields = (guest: DraftBooking["guest"]) => {
    setDraft((current) => ({ ...current, guest }));
  };

  const quote = draft.serviceId
    ? createQuote({
        serviceId: draft.serviceId,
        addOnIds: draft.addOnIds,
        startIso: draft.selectedSlotIso,
      })
    : createQuote({ serviceId: defaultDraft.serviceId ?? "", addOnIds: [], startIso: null });

  return (
    <BookingContext.Provider
      value={{
        draft,
        quote,
        staff,
        staffLoading,
        updateDraft,
        resetDraft,
        setGuestFields,
        confirmedBooking,
        setConfirmedBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) throw new Error("useBooking must be used within BookingProvider");
  return value;
}
