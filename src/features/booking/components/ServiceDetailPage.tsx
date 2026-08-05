import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createAppointment,
  fetchAvailableSlotsForMonth,
  fetchServiceBySlug,
  getBookingErrorMessage,
  getTodayDateIso,
  type AvailableSlot,
} from "../data/supabaseBooking";
import {
  formatServiceDuration,
  getServiceAddOns,
  getServiceArabicCopy,
  getServiceBySlug,
  parseServiceDuration,
  parseServicePrice,
  type ServiceAddOnOption,
  type ServiceGroupId,
  type ServiceMenuItem,
} from "../data/serviceMenu";
import { requestAppointmentReminderSubscription, type ReminderSubscriptionResult } from "../pwa/reminders";

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
  appointmentId: string;
  serviceName: string;
  addOnNames: string[];
  totalPrice: string;
  totalDuration: string;
  date: string;
  time: string;
  phone: string;
};

type ReminderStatus = "idle" | "loading" | "success" | "info" | "error";

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
  const [todayYear, todayMonth] = getTodayDateIso().split("-").map(Number);
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(todayYear, todayMonth - 1 + index, 1);
    return {
      month: date.toLocaleDateString("en-US", { month: "long" }),
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
    };
  });
}

function formatServicePrice(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function getOptimizedImage(src: string) {
  return `/optimized${src.replace(/\.png$/i, ".webp")}`;
}

export function ServiceDetailPage({ groupId, serviceSlug }: ServiceDetailPageProps) {
  const navigate = useNavigate();
  const monthOptions = useMemo(() => createMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const hardcodedService = useMemo(() => getServiceBySlug(groupId, serviceSlug), [groupId, serviceSlug]);
  const [service, setService] = useState<ServiceMenuItem | null>(hardcodedService);
  const [serviceLoading, setServiceLoading] = useState(!hardcodedService);
  const [serviceError, setServiceError] = useState("");
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [selectedDateIso, setSelectedDateIso] = useState("");
  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAddOnSlugs, setSelectedAddOnSlugs] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>("idle");
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadService() {
      if (!hardcodedService) {
        setService(null);
        setServiceError("This service is not available.");
        setServiceLoading(false);
        return;
      }

      try {
        setService(hardcodedService);
        setServiceLoading(false);
        setServiceError("");
        const activeService = await fetchServiceBySlug(groupId, serviceSlug);
        if (!isCurrent) return;

        if (!activeService) return;

        setService(activeService);
        if (!activeService.id) {
          setAvailabilityError("Online booking is not available for this service right now.");
        }
      } catch {
        if (!isCurrent) return;
        setService(hardcodedService);
        setAvailabilityError("Online booking is not available for this service right now.");
      } finally {
        if (isCurrent) setServiceLoading(false);
      }
    }

    loadService();

    return () => {
      isCurrent = false;
    };
  }, [groupId, hardcodedService, serviceSlug]);

  const availableAddOns = useMemo(
    () => (service ? getServiceAddOns(groupId, service.slug) : []),
    [groupId, service],
  );

  const selectedAddOns = useMemo(
    () => availableAddOns.filter((addOn) => selectedAddOnSlugs.includes(addOn.slug)),
    [availableAddOns, selectedAddOnSlugs],
  );

  const totalPrice = useMemo(() => {
    const servicePrice = service ? parseServicePrice(service.price) : 0;
    return servicePrice + selectedAddOns.reduce((total, addOn) => total + addOn.priceValue, 0);
  }, [selectedAddOns, service]);

  const totalDurationMin = useMemo(() => {
    const serviceDuration = service ? parseServiceDuration(service.duration) : 0;
    return serviceDuration + selectedAddOns.reduce((total, addOn) => total + addOn.durationMin, 0);
  }, [selectedAddOns, service]);

  const loadMonthAvailability = useCallback(async () => {
    if (!service?.id) return;

    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const daysInMonth = new Date(selectedMonth.year, selectedMonth.monthIndex + 1, 0).getDate();
      const monthStartIso = formatDateIso(selectedMonth.year, selectedMonth.monthIndex, 1);
      const todayDateIso = getTodayDateIso();
      const monthSlots = await fetchAvailableSlotsForMonth(service.id as string, monthStartIso, totalDurationMin);
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
        }).filter((day) => day.dateIso >= todayDateIso);

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
  }, [selectedMonth.monthIndex, selectedMonth.year, service?.id, totalDurationMin]);

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

  useEffect(() => {
    setSelectedAddOnSlugs([]);
  }, [serviceSlug]);

  const chooseMonth = (month: (typeof monthOptions)[number]) => {
    setSelectedMonth(month);
    setSelectedDateIso("");
    setSelectedSlotStart("");
  };

  const toggleAddOn = (addOn: ServiceAddOnOption) => {
    setSelectedAddOnSlugs((current) => {
      if (current.includes(addOn.slug)) {
        return current.filter((slug) => slug !== addOn.slug);
      }

      const blockedSlugs = new Set(addOn.conflictsWith ?? []);
      const next = current.filter((slug) => {
        const existing = availableAddOns.find((option) => option.slug === slug);
        if (blockedSlugs.has(slug)) return false;
        if (addOn.exclusiveGroup && existing?.exclusiveGroup === addOn.exclusiveGroup) return false;
        return true;
      });

      return [...next, addOn.slug];
    });
  };

  const submitCustomerForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!service?.id || !selectedSlot || !selectedDateIso) {
      setFormError("Please choose an available appointment time.");
      return;
    }

    if (selectedDateIso < getTodayDateIso()) {
      setFormError("Appointments must be booked for today or a future date.");
      await loadMonthAvailability();
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
      const appointmentId = await createAppointment({
        serviceId: service.id,
        customerFullName: `${firstName} ${lastName}`,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone,
        appointmentStart: selectedSlot.startIso,
        selectedServices: [
          {
            id: service.id,
            slug: service.slug,
            kind: "service",
            name: service.name,
            price: parseServicePrice(service.price),
            duration_minutes: parseServiceDuration(service.duration),
          },
          ...selectedAddOns.map((addOn) => ({
            slug: addOn.slug,
            kind: "add_on" as const,
            name: addOn.name,
            price: addOn.priceValue,
            duration_minutes: addOn.durationMin,
          })),
        ],
        totalPrice,
        totalDurationMinutes: totalDurationMin,
      });

      setSuccessDetails({
        appointmentId,
        serviceName: service.name,
        addOnNames: selectedAddOns.map((addOn) => addOn.name),
        totalPrice: formatServicePrice(totalPrice),
        totalDuration: formatServiceDuration(totalDurationMin),
        date: formatLongDate(selectedDateIso),
        time: selectedSlot.label,
        phone,
      });
      setReminderStatus("idle");
      setReminderMessage("");
      setShowCustomerForm(false);
      setShowSuccess(true);
    } catch (error) {
      setFormError(getBookingErrorMessage(error));
      await loadMonthAvailability();
    } finally {
      setIsSubmitting(false);
    }
  };

  const enableReminders = async () => {
    if (!successDetails?.appointmentId) return;

    setReminderStatus("loading");
    setReminderMessage("");

    const result: ReminderSubscriptionResult = await requestAppointmentReminderSubscription({
      appointmentId: successDetails.appointmentId,
      customerPhone: successDetails.phone,
    });

    if (result.status === "subscribed") {
      setReminderStatus("success");
      setReminderMessage("Appointment reminders are enabled for this booking.");
      return;
    }

    setReminderStatus(result.status === "denied" || result.status === "error" ? "error" : "info");
    setReminderMessage(result.message);
  };

  if (serviceLoading || serviceError || !service) {
    return (
      <main className="min-h-screen bg-[#fbf7f3] px-4 py-8 text-[#241b18] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[76rem]">
          <div className="rounded-[1.5rem] border border-[#ead5cd] bg-white p-6 text-sm leading-6 text-[#6d5648] shadow-sm">
            <Link
              to={`/book/${groupId}`}
              className="mb-4 inline-flex min-h-10 items-center rounded-full border border-[#e7c9c2] bg-[#fffaf6]/92 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d3f1f]"
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
    <main className="min-h-screen bg-[#fbf7f3] px-4 pb-20 pt-4 text-[#241b18] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[86rem]">
        <nav className="mb-4 flex h-14 items-center justify-between" aria-label="Booking navigation">
          <Link to="/" className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#7d463d]" aria-label="Pastel home">Pastel</Link>
          <div className="hidden items-center gap-3 text-xs font-semibold text-[#88736c] sm:flex">
            <span>1 · Service</span><span>—</span><span className="rounded-full bg-[#8d5147] px-3 py-1.5 text-white">2 · Time</span><span>—</span><span>3 · Confirm</span>
          </div>
        </nav>

        <section className="service-detail-hero grid overflow-hidden rounded-[2rem] border border-[#eadfda] bg-[#fffdfa] shadow-[0_20px_60px_rgba(79,50,43,0.1)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[18rem] overflow-hidden bg-[#eaded8] sm:min-h-[22rem] lg:min-h-[28rem]">
            <img
              src={getOptimizedImage(service.imageSrc)}
              alt={service.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = decodeURIComponent(service.imageSrc);
              }}
            />
            <Link
              to={`/book/${groupId}`}
              className="service-detail-back absolute left-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/50 bg-white/88 px-4 text-sm font-semibold text-[#4d4039] shadow-[0_12px_24px_rgba(97,58,24,0.12)] backdrop-blur-md sm:left-5 sm:top-5"
            >
              <span aria-hidden="true">‹</span>
              Back
            </Link>
          </div>

          <div className="flex flex-col px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9a5c52]">{service.serviceType}</p>
            <h1 className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-display text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.035em] text-[#342521] sm:text-[3.4rem]">
              <span>{service.name}</span>
              <span lang="ar" dir="rtl" className="text-[0.62em] leading-tight text-[#98594f]">
                {arabicCopy.title}
              </span>
            </h1>
            <p className="mt-5 font-display text-[2.35rem] font-semibold leading-none text-[#9a5b51]">
              {formatServicePrice(totalPrice)}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#66534d] sm:text-base">
              {service.description}
            </p>

            <div className="mt-auto grid gap-4 pt-7 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <DetailRow icon="◷" label="Duration" arabicLabel="المدة" value={formatServiceDuration(totalDurationMin)} />
              <DetailRow icon="▣" label="Service type" arabicLabel="نوع الخدمة" value={service.serviceType} />
            </div>
          </div>
        </section>

        <div
          className="sticky top-3 z-40 mt-5 flex min-h-16 items-center justify-between gap-4 rounded-full border border-[#e4d5d0] bg-[#fffdfa]/92 px-5 py-3 shadow-[0_12px_32px_rgba(79,50,43,0.12)] backdrop-blur-xl sm:px-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d5648]">Total</span>
          <span className="flex items-baseline gap-2 text-right">
            <strong className="font-display text-[1.65rem] font-semibold leading-none text-[#b46f65]">
              {formatServicePrice(totalPrice)}
            </strong>
            <span className="text-xs font-medium text-[#6d5648] sm:text-sm">
              {formatServiceDuration(totalDurationMin)}
            </span>
          </span>
        </div>

        {availableAddOns.length > 0 ? (
          <section className="service-detail-panel mt-5 rounded-[2rem] border border-[#eadfda] bg-[#fffdfa] p-5 shadow-[0_16px_45px_rgba(79,50,43,0.07)] sm:p-6 lg:p-8" aria-labelledby="add-ons-title">
            <h2 id="add-ons-title" className="font-display text-[1.65rem] font-semibold leading-none text-[#231814] sm:text-[2.25rem]">
              Add to your service
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6d5648]">Choose any compatible extras. French and Ombré replace one another.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableAddOns.map((addOn) => {
                const selected = selectedAddOnSlugs.includes(addOn.slug);
                return (
                  <button
                    key={addOn.slug}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAddOn(addOn)}
                    className={`flex min-h-28 items-center gap-4 rounded-[1.25rem] border p-3 text-left transition ${
                      selected
                        ? "border-[#b76f64] bg-[#f6e5e1] shadow-[0_8px_18px_rgba(97,58,24,0.08)]"
                        : "border-[#ead5cd] bg-white/60 hover:border-[#bd736b] hover:bg-white"
                    }`}
                  >
                    <img src={getOptimizedImage(addOn.imageSrc)} alt="" aria-hidden="true" className="h-20 w-20 flex-none rounded-[0.9rem] object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = decodeURIComponent(addOn.imageSrc); }} />
                    <span className="min-w-0">
                      <strong className="block font-display text-lg leading-tight text-[#231814]">{addOn.name}</strong>
                      <span className="mt-1 block text-sm font-medium text-[#b46f65]">+{addOn.price} · {addOn.duration}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#6d5648]">{addOn.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="service-detail-panel mt-5 rounded-[2rem] border border-[#eadfda] bg-[#fffdfa] p-5 shadow-[0_16px_45px_rgba(79,50,43,0.07)] sm:p-6 lg:p-8">
          <h2 className="font-display text-[1.8rem] font-semibold leading-none text-[#231814] sm:text-[2.25rem]">
            Select Your Appointment
          </h2>

          <AppointmentStep icon="□" number="1" title="Choose Month">
            <div className="flex w-full max-w-full gap-3 overflow-x-auto px-0.5 pb-2">
              {monthOptions.map((item) => (
                <button
                  key={`${item.month}-${item.year}`}
                  type="button"
                  onClick={() => chooseMonth(item)}
                  className={`min-h-16 flex-[0_0_7.2rem] rounded-[1rem] border px-3 text-center text-sm font-medium leading-6 transition sm:flex-[0_0_8.25rem] ${
                    selectedMonth.monthIndex === item.monthIndex && selectedMonth.year === item.year
                      ? "border-[#8d5147] bg-[#8d5147] text-white shadow-sm"
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
              <div className="flex w-full max-w-full gap-3 overflow-x-auto px-0.5 pb-2">
                {days.map((day) => {
                  const disabled = day.available === 0;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDateIso(day.dateIso)}
                      className={`min-h-24 flex-[0_0_5.85rem] rounded-[1rem] border px-2 py-3 text-center transition sm:flex-[0_0_6.5rem] ${
                        disabled
                          ? "cursor-not-allowed border-dashed border-[#8c7c75] bg-[#7d726d]/20 text-[#5f514b]"
                          : selectedDateIso === day.dateIso
                            ? "border-[#8d5147] bg-[#8d5147] text-white shadow-[0_8px_18px_rgba(97,58,24,0.08)]"
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
                    className={`min-h-[3.25rem] rounded-full border px-3 text-base font-medium transition ${
                      selectedSlotStart === slot.startIso
                        ? "border-[#8d5147] bg-[#8d5147] text-white shadow-sm"
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
            className="mt-8 flex min-h-[4.25rem] w-full items-center justify-center gap-5 rounded-full bg-[#8d5147] px-5 text-center font-display text-[1.35rem] text-white shadow-[0_14px_28px_rgba(141,81,71,0.25)] transition hover:-translate-y-0.5 hover:bg-[#754138] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#7d726d]/45 disabled:shadow-none sm:text-[1.65rem]"
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
          <form className="booking-form-popup max-h-[calc(100svh-2rem)] w-full max-w-[26rem] overflow-y-auto rounded-[2rem] bg-[#fffdfa] p-6 shadow-[0_24px_70px_rgba(97,58,24,0.26)] sm:p-7" onSubmit={submitCustomerForm}>
            <h2 id="customer-form-title" className="font-display text-[2rem] font-semibold leading-none text-[#231814]">
              Confirm your details
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6d5648]">
              Enter your contact information so we can confirm your appointment.
            </p>

            <label className="mt-5 block text-sm font-semibold text-[#4d4039]">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>First name</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  الاسم الأول
                </span>
              </span>
              <input className="mt-2 block min-h-12 w-full rounded-xl border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b] focus:ring-4 focus:ring-[#f0dfdb]" name="firstName" autoComplete="given-name" required />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#4d4039]">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>Last name</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  اسم العائلة
                </span>
              </span>
              <input className="mt-2 block min-h-12 w-full rounded-xl border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b] focus:ring-4 focus:ring-[#f0dfdb]" name="lastName" autoComplete="family-name" required />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#4d4039]">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>Phone number</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  رقم الهاتف
                </span>
              </span>
              <input className="mt-2 block min-h-12 w-full rounded-xl border border-[#ead5cd] bg-white px-4 text-[#231814] outline-none focus:border-[#bd736b] focus:ring-4 focus:ring-[#f0dfdb]" name="phone" type="tel" autoComplete="tel" required />
            </label>

            {formError ? <p className="mt-4 text-sm leading-5 text-[#8a4545]">{formError}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={isSubmitting} onClick={() => setShowCustomerForm(false)} className="grid min-h-14 place-items-center rounded-full border border-[#ead5cd] bg-white px-4 py-2 text-sm font-semibold text-[#6d3f1f] disabled:cursor-not-allowed">
                <span className="grid gap-1 leading-none">
                  <span className="uppercase tracking-[0.14em]">Back</span>
                  <span lang="ar" dir="rtl">
                    رجوع
                  </span>
                </span>
              </button>
              <button type="submit" disabled={isSubmitting} className="grid min-h-14 place-items-center rounded-full bg-[#8d5147] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#754138] disabled:cursor-not-allowed">
                <span className="grid gap-1 leading-none">
                  <span className="uppercase tracking-[0.14em]">{isSubmitting ? "Submitting..." : "Submit"}</span>
                  <span lang="ar" dir="rtl">
                    {isSubmitting ? "جاري الإرسال" : "إرسال"}
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#231814]/28 px-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="success-popup relative w-full max-w-[23rem] rounded-[2rem] bg-[#8d5147] px-6 pb-6 pt-10 text-center text-white shadow-[0_24px_70px_rgba(97,58,24,0.28)]">
            <span className="success-popup-icon absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-[#8d5147] text-3xl font-semibold leading-none text-white shadow-[0_12px_28px_rgba(97,58,24,0.2)]">
              ✓
            </span>
            <h2 className="font-display text-[1.8rem] font-semibold leading-tight text-white">
              Appointment booked successfully.
            </h2>
            {successDetails ? (
              <p className="mt-3 text-sm leading-6 text-white/90">
                {successDetails.serviceName}
                {successDetails.addOnNames.length > 0 ? ` + ${successDetails.addOnNames.join(" + ")}` : ""}
                <br />
                {successDetails.totalPrice} · {successDetails.totalDuration}
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
            {successDetails ? (
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={enableReminders}
                  disabled={reminderStatus === "loading" || reminderStatus === "success"}
                  className="min-h-11 rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8d5147] disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {reminderStatus === "loading" ? "Enabling..." : "Enable appointment reminders"}
                </button>
                {reminderMessage ? (
                  <p className={`text-xs leading-5 ${reminderStatus === "error" ? "text-white" : "text-white/90"}`}>
                    {reminderMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 min-h-11 rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#8d5147]"
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
      <span className="service-detail-icon grid h-11 w-11 place-items-center rounded-full bg-[#f2e7e2] text-lg text-[#a25b54]">
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
      <span className="service-detail-icon hidden h-11 w-11 place-items-center rounded-full bg-[#f2e7e2] text-[#a25b54] lg:grid">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg leading-none text-[#231814] sm:text-xl">
          {number}. {title}
        </h3>
        <div className="mt-4 min-w-0 max-w-full">{children}</div>
      </div>
    </div>
  );
}
