import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createAppointment,
  fetchAvailableSlotsForMonth,
  fetchServiceBySlug,
  getBookingErrorMessage,
  type AvailableSlot,
} from "../data/supabaseBooking";
import { getServiceArabicCopy, type ServiceGroupId, type ServiceMenuItem } from "../data/serviceMenu";

type ServiceDetailPageProps = {
  groupId: ServiceGroupId;
  serviceSlug: string;
};

type DayAvailability = {
  dateIso: string;
  weekday: string;
  day: string;
  available: number;
  slots: AvailableSlot[];
};

type SuccessDetails = {
  serviceName: string;
  date: string;
  time: string;
  phone: string;
};

function formatDateIso(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${month}-${dayText}`;
}

function getSlotDateIso(slot: AvailableSlot) {
  return slot.startIso.slice(0, 10);
}

function formatLongDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function createMonthOptions() {
  const today = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
    return {
      month: date.toLocaleDateString("en-US", { month: "long" }),
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
    };
  });
}

export function ServiceDetailPage({ groupId, serviceSlug }: ServiceDetailPageProps) {
  const navigate = useNavigate();
  const monthOptions = useMemo(() => createMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [service, setService] = useState<ServiceMenuItem | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [selectedDateIso, setSelectedDateIso] = useState("");
  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadService() {
      try {
        setServiceLoading(true);
        setServiceError("");
        const activeService = await fetchServiceBySlug(groupId, serviceSlug);
        if (!isCurrent) return;

        if (!activeService?.id) {
          setService(null);
          setServiceError("This service is not available right now.");
          return;
        }

        setService(activeService);
      } catch {
        if (isCurrent) setServiceError("Unable to load this service. Please try again.");
      } finally {
        if (isCurrent) setServiceLoading(false);
      }
    }

    loadService();

    return () => {
      isCurrent = false;
    };
  }, [groupId, serviceSlug]);

  const loadMonthAvailability = useCallback(async () => {
    if (!service?.id) return;

    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const daysInMonth = new Date(selectedMonth.year, selectedMonth.monthIndex + 1, 0).getDate();
      const monthStartIso = formatDateIso(selectedMonth.year, selectedMonth.monthIndex, 1);
      const monthSlots = await fetchAvailableSlotsForMonth(service.id as string, monthStartIso);
      const slotsByDate = monthSlots.reduce<Map<string, AvailableSlot[]>>((groups, slot) => {
        const dateIso = getSlotDateIso(slot);
        const currentSlots = groups.get(dateIso) ?? [];
        currentSlots.push(slot);
        groups.set(dateIso, currentSlots);
        return groups;
      }, new Map());

      const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
          const dayNumber = index + 1;
          const dateIso = formatDateIso(selectedMonth.year, selectedMonth.monthIndex, dayNumber);
          const date = new Date(selectedMonth.year, selectedMonth.monthIndex, dayNumber);
          const slots = slotsByDate.get(dateIso) ?? [];

          return {
            dateIso,
            weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
            day: String(dayNumber),
            available: slots.length,
            slots,
          };
        });

      setDays(monthDays);
      setSelectedDateIso((currentDate) => {
        const currentStillAvailable = monthDays.some((day) => day.dateIso === currentDate && day.available > 0);
        if (currentStillAvailable) return currentDate;
        return monthDays.find((day) => day.available > 0)?.dateIso ?? "";
      });
    } catch {
      setDays([]);
      setSelectedDateIso("");
      setSelectedSlotStart("");
      setAvailabilityError("Unable to load available times. Please try again.");
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedMonth.monthIndex, selectedMonth.year, service?.id]);

  useEffect(() => {
    loadMonthAvailability();
  }, [loadMonthAvailability]);

  const selectedDaySlots = useMemo(
    () => days.find((day) => day.dateIso === selectedDateIso)?.slots ?? [],
    [days, selectedDateIso],
  );

  useEffect(() => {
    setSelectedSlotStart((currentSlot) => {
      const currentStillAvailable = selectedDaySlots.some((slot) => slot.startIso === currentSlot);
      if (currentStillAvailable) return currentSlot;
      return selectedDaySlots[0]?.startIso ?? "";
    });
  }, [selectedDaySlots]);

  const selectedSlot = useMemo(
    () => selectedDaySlots.find((slot) => slot.startIso === selectedSlotStart) ?? null,
    [selectedDaySlots, selectedSlotStart],
  );

  const chooseMonth = (month: (typeof monthOptions)[number]) => {
    setSelectedMonth(month);
    setSelectedDateIso("");
    setSelectedSlotStart("");
  };

  const submitCustomerForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!service?.id || !selectedSlot || !selectedDateIso) {
      setFormError("Please choose an available appointment time.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!firstName || !lastName || !phone) {
      setFormError("Please enter your full name and phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createAppointment({
        serviceId: service.id,
        customerFullName: `${firstName} ${lastName}`,
        customerPhone: phone,
        appointmentStart: selectedSlot.startIso,
      });

      setSuccessDetails({
        serviceName: service.name,
        date: formatLongDate(selectedDateIso),
        time: selectedSlot.label,
        phone,
      });
      setShowCustomerForm(false);
      setShowSuccess(true);
    } catch (error) {
      setFormError(getBookingErrorMessage(error));
      await loadMonthAvailability();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (serviceLoading || serviceError || !service) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f4_0%,#f7efe6_54%,#ead9c9_100%)] px-3 py-4 text-[#231814] sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[76rem]">
          <div className="border border-[#ead5cd] bg-[#fffaf6]/92 p-6 text-sm leading-6 text-[#6d5648]">
            <Link
              to={`/book/${groupId}`}
              className="mb-4 inline-flex min-h-10 items-center border border-[#e7c9c2] bg-[#fffaf6]/92 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d3f1f]"
            >
              Back
            </Link>
            <p>{serviceLoading ? "Loading service..." : serviceError}</p>
          </div>
        </div>
      </main>
    );
  }

  const arabicCopy = getServiceArabicCopy(service.slug);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f4_0%,#f7efe6_54%,#ead9c9_100%)] px-3 py-4 text-[#231814] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[76rem]">
        <section className="service-detail-hero grid overflow-hidden bg-[#fffaf6] shadow-[0_18px_44px_rgba(97,58,24,0.12)] lg:grid-cols-[1.15fr_0.95fr]">
          <div className="relative min-h-[18rem] overflow-hidden sm:min-h-[20rem] lg:min-h-[24rem]">
            <img src={service.imageSrc} alt={service.name} className="h-full w-full object-cover" />
            <Link
              to={`/book/${groupId}`}
              className="service-detail-back absolute left-5 top-5 inline-flex items-center gap-3 bg-white/88 px-4 py-3 text-sm font-medium text-[#4d4039] shadow-[0_12px_24px_rgba(97,58,24,0.12)] backdrop-blur-md sm:text-base"
            >
              <span className="grid h-9 w-9 place-items-center bg-white text-2xl leading-none text-[#231814] shadow-[0_6px_18px_rgba(97,58,24,0.12)]">
                ‹
              </span>
              Back
            </Link>
          </div>

          <div className="px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
            <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-[1.55rem] font-semibold leading-none text-[#231814] sm:text-[2.7rem]">
              <span>{service.name}</span>
              <span lang="ar" dir="rtl" className="text-[0.82em] leading-tight text-[#5a2f1b]">
                {arabicCopy.title}
              </span>
            </h1>
            <p className="mt-4 text-[2rem] font-medium leading-none text-[#b46f65]">
              {service.price}
            </p>
            <p className="mt-5 max-w-md text-base leading-7 text-[#4d4039]">
              {service.description}
            </p>

            <div className="mt-6 grid gap-4">
              <DetailRow icon="◷" label="Duration" arabicLabel="المدة" value={service.duration || "Based on service"} />
              <DetailRow icon="▣" label="Service type" arabicLabel="نوع الخدمة" value={service.serviceType} />
            </div>
          </div>
        </section>

        <section className="service-detail-panel mt-5 bg-[#fffaf6] p-5 shadow-[0_18px_44px_rgba(97,58,24,0.1)] sm:p-6 lg:p-8">
          <h2 className="whitespace-nowrap font-display text-[1.2rem] font-semibold leading-none text-[#231814] sm:text-[2.25rem]">
            Select Your Appointment
          </h2>

          <AppointmentStep icon="□" number="1" title="Choose Month">
            <div className="flex gap-3 overflow-x-auto px-0.5 pb-2">
              {monthOptions.map((item) => (
                <button
                  key={`${item.month}-${item.year}`}
                  type="button"
                  onClick={() => chooseMonth(item)}
                  className={`min-h-16 flex-[0_0_7.2rem] border px-3 text-center text-base leading-6 transition sm:flex-[0_0_8.25rem] ${
                    selectedMonth.monthIndex === item.monthIndex && selectedMonth.year === item.year
                      ? "border-[#bd736b] bg-[#bd736b] text-white"
                      : "border-[#ead5cd] bg-white/50 text-[#231814] hover:border-[#bd736b]"
                  }`}
                >
                  <span className="block">{item.month}</span>
                  <span className="block">{item.year}</span>
                </button>
              ))}
            </div>
          </AppointmentStep>

          <AppointmentStep icon="□" number="2" title="Choose Day">
            {availabilityLoading ? <p className="text-sm text-[#6d5648]">Loading available days...</p> : null}
            {!availabilityLoading && availabilityError ? <p className="text-sm text-[#8a4545]">{availabilityError}</p> : null}
            {!availabilityLoading && !availabilityError ? (
              <div className="flex gap-3 overflow-x-auto px-0.5 pb-2">
                {days.map((day) => {
                  const disabled = day.available === 0;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDateIso(day.dateIso)}
                      className={`min-h-24 flex-[0_0_5.85rem] border px-2 py-3 text-center transition sm:flex-[0_0_6.5rem] ${
                        disabled
                          ? "cursor-not-allowed border-dashed border-[#8c7c75] bg-[#7d726d]/20 text-[#5f514b]"
                          : selectedDateIso === day.dateIso
                            ? "border-[#bd736b] bg-[#bd736b] text-white shadow-[0_8px_18px_rgba(97,58,24,0.08)]"
                            : "border-[#ead5cd] bg-white/50 text-[#231814] hover:border-[#bd736b]"
                      }`}
                    >
                      <span className={`block text-sm ${selectedDateIso === day.dateIso && !disabled ? "text-white" : "text-[#756964]"}`}>
                        {day.weekday}
                      </span>
                      <span className="mt-1.5 block text-[1.75rem] leading-none">{day.day}</span>
                      <span className={`mt-2.5 block text-xs ${
                        selectedDateIso === day.dateIso && !disabled ? "text-white" : disabled ? "text-[#5f514b]" : "text-[#a25b54]"
                      }`}>
                        {disabled ? "No availability" : `${day.available} available`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </AppointmentStep>

          <AppointmentStep icon="◷" number="3" title="Choose Time">
            {availabilityLoading ? <p className="text-sm text-[#6d5648]">Loading available times...</p> : null}
            {!availabilityLoading && selectedDateIso && selectedDaySlots.length === 0 ? (
              <p className="text-sm text-[#6d5648]">No available times for this day.</p>
            ) : null}
            {!availabilityLoading && selectedDaySlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {selectedDaySlots.map((slot) => (
                  <button
                    key={slot.startIso}
                    type="button"
                    onClick={() => setSelectedSlotStart(slot.startIso)}
                    className={`min-h-[3.25rem] border px-3 text-base transition ${
                      selectedSlotStart === slot.startIso
                        ? "border-[#bd736b] bg-[#bd736b] text-white"
                        : "border-[#ead5cd] bg-white/50 text-[#4d4039] hover:border-[#bd736b]"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            ) : null}
          </AppointmentStep>

          <button
            type="button"
            disabled={availabilityLoading || !selectedSlot}
            onClick={() => setShowCustomerForm(true)}
            className="mt-6 flex min-h-[4.25rem] w-full items-center justify-center gap-5 bg-[#bd736b] px-5 text-center font-display text-[1.35rem] text-white shadow-[0_14px_28px_rgba(189,115,107,0.28)] transition hover:bg-[#a9615b] disabled:cursor-not-allowed disabled:bg-[#7d726d]/45 disabled:shadow-none sm:text-[1.65rem]"
          >
            <span className="grid gap-1 leading-none">
              <span>Continue to Booking</span>
              <span lang="ar" dir="rtl" className="text-[0.78em]">
                تابع الحجز
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>

      {showCustomerForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#231814]/28 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
          <form className="booking-form-popup w-full max-w-[24rem] bg-[#fffaf6] p-6 shadow-[0_24px_70px_rgba(97,58,24,0.26)]" onSubmit={submitCustomerForm}>
            <h2 id="customer-form-title" className="font-display text-[2rem] font-semibold leading-none text-[#231814]">
              Confirm your details
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6d5648]">
              Enter your contact information so we can confirm your appointment.
            </p>

            <label className="mt-5 block text-sm font-semibold text-[#4d4039]">
              First name
              <input className="mt-2 block min-h-12 w-full border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b]" name="firstName" autoComplete="given-name" required />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#4d4039]">
              Last name
              <input className="mt-2 block min-h-12 w-full border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b]" name="lastName" autoComplete="family-name" required />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#4d4039]">
              Phone number
              <input className="mt-2 block min-h-12 w-full border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b]" name="phone" type="tel" autoComplete="tel" required />
            </label>

            {formError ? <p className="mt-4 text-sm leading-5 text-[#8a4545]">{formError}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={isSubmitting} onClick={() => setShowCustomerForm(false)} className="min-h-12 border border-[#ead5cd] bg-white px-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6d3f1f] disabled:cursor-not-allowed">
                Back
              </button>
              <button type="submit" disabled={isSubmitting} className="min-h-12 bg-[#bd736b] px-4 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed">
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#231814]/28 px-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="success-popup relative w-full max-w-[22rem] bg-[#d68599] px-6 pb-6 pt-10 text-center text-white shadow-[0_24px_70px_rgba(97,58,24,0.28)]">
            <span className="success-popup-icon absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center border-4 border-white bg-[#d68599] text-3xl font-semibold leading-none text-white shadow-[0_12px_28px_rgba(97,58,24,0.2)]">
              ✓
            </span>
            <h2 className="font-display text-[1.8rem] font-semibold leading-tight text-white">
              Appointment booked successfully.
            </h2>
            {successDetails ? (
              <p className="mt-3 text-sm leading-6 text-white/90">
                {successDetails.serviceName}
                <br />
                {successDetails.date} at {successDetails.time}
                <br />
                Phone: {successDetails.phone}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-white/90">
                Thank you. Your appointment request has been received.
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 min-h-11 bg-white px-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#b46f65]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DetailRow({ icon, label, arabicLabel, value }: { icon: string; label: string; arabicLabel: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="service-detail-icon grid h-11 w-11 place-items-center bg-[#f2e7e2] text-lg text-[#a25b54]">
        {icon}
      </span>
      <div>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-[#6d5648]">
          <span>{label}</span>
          <span aria-hidden="true">/</span>
          <span lang="ar" dir="rtl">
            {arabicLabel}
          </span>
        </p>
        <p className="mt-1 font-display text-lg leading-none text-[#231814]">{value}</p>
      </div>
    </div>
  );
}

function AppointmentStep({
  icon,
  number,
  title,
  children,
}: {
  icon: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-7 grid gap-3 lg:grid-cols-[2.75rem_1fr] lg:gap-5">
      <span className="service-detail-icon hidden h-11 w-11 place-items-center bg-[#f2e7e2] text-[#a25b54] lg:grid">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-lg leading-none text-[#231814] sm:text-xl">
          {number}. {title}
        </h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
