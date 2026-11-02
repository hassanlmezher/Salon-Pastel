import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
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
import { serviceImageUrl } from "./ServiceMenuPage";
import { buildCalendarFileUrl } from "../logic/calendarFile";

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
  startIso: string;
  durationMinutes: number;
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

const SAVED_CUSTOMER_KEY = "pastel-customer";

type SavedCustomer = { fullName: string; phone: string };

/** Returning customers get their name and phone filled in. */
function loadSavedCustomer(): SavedCustomer {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_CUSTOMER_KEY) ?? "null") as Partial<SavedCustomer> | null;
    return { fullName: String(saved?.fullName ?? ""), phone: String(saved?.phone ?? "") };
  } catch {
    return { fullName: "", phone: "" };
  }
}

function saveCustomer(customer: SavedCustomer) {
  try {
    localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(customer));
  } catch {
    // Private mode or blocked storage: the next booking just starts empty.
  }
}

function formatShortDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
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
  // Starts true so the page never claims "no free times" before the first lookup finishes.
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [customer, setCustomer] = useState(loadSavedCustomer);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAddOnSlugs, setSelectedAddOnSlugs] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);

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

        if (!activeService) {
          setAvailabilityLoading(false);
          return;
        }

        setService(activeService);
        if (!activeService.id) {
          setAvailabilityError("Online booking is not available for this service right now.");
          setAvailabilityLoading(false);
        }
      } catch {
        if (!isCurrent) return;
        setService(hardcodedService);
        setAvailabilityError("Online booking is not available for this service right now.");
        setAvailabilityLoading(false);
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

  const openDays = useMemo(() => days.filter((day) => day.available > 0), [days]);
  const selectedMonthPosition = monthOptions.findIndex(
    (option) => option.monthIndex === selectedMonth.monthIndex && option.year === selectedMonth.year,
  );

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

    const fullName = customer.fullName.trim().replace(/\s+/g, " ");
    const phone = customer.phone.trim();
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    if (!fullName || !phone) {
      setFormError("Please enter your name and phone number.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 7) {
      setFormError("Please enter a valid phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const appointmentId = await createAppointment({
        serviceId: service.id,
        customerFullName: fullName,
        customerFirstName: firstName,
        customerLastName: lastName || undefined,
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
        startIso: selectedSlot.startIso,
        durationMinutes: totalDurationMin,
      });
      saveCustomer({ fullName, phone });
      setShowSuccess(true);
    } catch (error) {
      setFormError(getBookingErrorMessage(error));
      await loadMonthAvailability();
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = groupId === "pedicure" ? "/book?type=pedicure" : "/book";

  if (serviceLoading || serviceError || !service) {
    return (
      <main className="min-h-screen bg-[#f7efe6] px-4 py-6 text-[#231814]">
        <div className="mx-auto max-w-2xl border border-[#ead5cd] bg-[#fffaf6] p-6 text-sm leading-6 text-[#6d5648]">
          <Link to={backHref} className="mb-4 inline-flex min-h-11 items-center font-semibold text-[#a25b54]">
            ‹ All services
          </Link>
          <p>{serviceLoading ? "Loading service..." : serviceError}</p>
        </div>
      </main>
    );
  }

  const arabicCopy = getServiceArabicCopy(service.slug);
  const canBook = Boolean(selectedSlot) && !availabilityLoading && !isSubmitting;
  const sectionClass = "border border-[#ead5cd] bg-[#fffaf6] p-4 sm:p-5";
  const headingClass = "flex items-baseline justify-between gap-3 font-display text-[1.35rem] font-semibold leading-tight text-[#231814]";
  const inputClass =
    "mt-1.5 block min-h-12 w-full border border-[#ead5cd] bg-white px-4 text-base text-[#231814] outline-none focus:border-[#bd736b]";

  return (
    <main className="min-h-screen bg-[#f7efe6] pb-24 text-[#231814]">
      <header className="sticky top-0 z-30 border-b border-[#e7c9c2]/70 bg-[#f7efe6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          <Link
            to={backHref}
            aria-label="Back to all services"
            className="grid h-11 w-11 flex-none place-items-center border border-[#e7c9c2] bg-[#fffaf6] text-2xl leading-none text-[#6d3f1f]"
          >
            ‹
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">{service.name}</p>
            <p className="truncate text-xs text-[#6d5648]">
              {selectedAddOns.length > 0 ? `+ ${selectedAddOns.map((addOn) => addOn.name).join(" + ")}` : arabicCopy.title}
            </p>
          </div>
          <p className="flex-none text-right" aria-live="polite">
            <strong className="block font-display text-[1.4rem] font-semibold leading-none text-[#b46f65]">
              {formatServicePrice(totalPrice)}
            </strong>
            <span className="text-xs text-[#6d5648]">{formatServiceDuration(totalDurationMin)}</span>
          </p>
        </div>
      </header>

      <form
        onSubmit={submitCustomerForm}
        noValidate
        className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-3 px-4 pt-3 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-5"
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
          <section className={`${sectionClass} flex items-center gap-4`}>
            <img
              src={serviceImageUrl(service.imageSrc)}
              alt={service.name}
              width={96}
              height={96}
              className="h-24 w-24 flex-none object-cover"
            />
            <div className="min-w-0">
              <h1 className="font-display text-[1.6rem] font-semibold leading-tight">{service.name}</h1>
              <p lang="ar" dir="rtl" className="text-right text-base font-semibold text-[#5a2f1b]">
                {arabicCopy.title}
              </p>
              <p className="mt-1 text-sm leading-5 text-[#6d5648]">{service.description}</p>
            </div>
          </section>

          {availableAddOns.length > 0 ? (
            <section className={sectionClass} aria-labelledby="add-ons-title">
              <h2 id="add-ons-title" className={headingClass}>
                <span>Add extras <span className="text-sm font-normal text-[#6d5648]">(optional)</span></span>
                <span lang="ar" dir="rtl" className="text-base font-normal text-[#6d5648]">إضافات</span>
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {availableAddOns.map((addOn) => {
                  const selected = selectedAddOnSlugs.includes(addOn.slug);
                  return (
                    <button
                      key={addOn.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAddOn(addOn)}
                      className={`flex min-h-16 items-center gap-3 border p-2 text-left transition ${
                        selected ? "border-[#bd736b] bg-[#f9e9e5]" : "border-[#ead5cd] bg-white/60 hover:border-[#bd736b]"
                      }`}
                    >
                      <img src={serviceImageUrl(addOn.imageSrc)} alt="" aria-hidden="true" loading="lazy" className="h-12 w-12 flex-none object-cover" />
                      <span className="min-w-0 flex-1">
                        <strong className="block text-[0.95rem] font-semibold leading-tight text-[#231814]">{addOn.name}</strong>
                        <span className="block text-sm text-[#b46f65]">+{addOn.price} · {addOn.duration}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid h-7 w-7 flex-none place-items-center border text-sm font-bold ${
                          selected ? "border-[#bd736b] bg-[#bd736b] text-white" : "border-[#d9c2b9] bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className={sectionClass} aria-labelledby="time-title">
            <h2 id="time-title" className={headingClass}>
              <span>Pick a day &amp; time</span>
              <span lang="ar" dir="rtl" className="text-base font-normal text-[#6d5648]">اختاري الموعد</span>
            </h2>

            <div className="mt-3 flex items-center justify-between border border-[#ead5cd] bg-white/60">
              <button
                type="button"
                onClick={() => chooseMonth(monthOptions[selectedMonthPosition - 1])}
                disabled={selectedMonthPosition <= 0}
                aria-label="Previous month"
                className="grid h-11 w-12 place-items-center text-2xl text-[#a25b54] disabled:text-[#cbbdb6]"
              >
                ‹
              </button>
              <span className="font-display text-lg font-semibold" aria-live="polite">
                {selectedMonth.month} {selectedMonth.year}
              </span>
              <button
                type="button"
                onClick={() => chooseMonth(monthOptions[selectedMonthPosition + 1])}
                disabled={selectedMonthPosition >= monthOptions.length - 1}
                aria-label="Next month"
                className="grid h-11 w-12 place-items-center text-2xl text-[#a25b54] disabled:text-[#cbbdb6]"
              >
                ›
              </button>
            </div>

            <div className="mt-3 min-h-[5rem]">
              {availabilityLoading ? <p className="py-6 text-center text-sm text-[#6d5648]">Loading free times…</p> : null}
              {!availabilityLoading && availabilityError ? (
                <p className="py-4 text-sm leading-6 text-[#8a4545]">
                  {availabilityError} Call us on{" "}
                  <a href="tel:+96171430542" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">+961 71 430 542</a> to book.
                </p>
              ) : null}
              {!availabilityLoading && !availabilityError && openDays.length === 0 ? (
                <p className="py-4 text-sm leading-6 text-[#6d5648]">
                  No free times left in {selectedMonth.month}.{" "}
                  {selectedMonthPosition < monthOptions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => chooseMonth(monthOptions[selectedMonthPosition + 1])}
                      className="min-h-11 font-semibold text-[#a25b54] underline underline-offset-4"
                    >
                      See next month
                    </button>
                  ) : null}
                </p>
              ) : null}
              {!availabilityLoading && !availabilityError && openDays.length > 0 ? (
                <>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="radiogroup" aria-label="Day">
                    {openDays.map((day) => {
                      const active = selectedDateIso === day.dateIso;
                      return (
                        <button
                          key={day.dateIso}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedDateIso(day.dateIso)}
                          className={`min-h-[4.5rem] flex-[0_0_4rem] border py-2 text-center transition ${
                            active ? "border-[#bd736b] bg-[#bd736b] text-white" : "border-[#ead5cd] bg-white/60 hover:border-[#bd736b]"
                          }`}
                        >
                          <span className={`block text-xs ${active ? "text-white" : "text-[#756964]"}`}>{day.weekday}</span>
                          <span className="mt-1 block text-2xl leading-none">{day.day}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
                    {selectedDaySlots.map((slot) => {
                      const active = selectedSlotStart === slot.startIso;
                      return (
                        <button
                          key={slot.startIso}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedSlotStart(slot.startIso)}
                          className={`min-h-11 border px-1 text-[0.95rem] transition ${
                            active ? "border-[#bd736b] bg-[#bd736b] text-white" : "border-[#ead5cd] bg-white/60 text-[#4d4039] hover:border-[#bd736b]"
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>

        <section className={`${sectionClass} lg:sticky lg:top-[5.5rem]`} aria-labelledby="details-title">
          <h2 id="details-title" className={headingClass}>
            <span>Your details</span>
            <span lang="ar" dir="rtl" className="text-base font-normal text-[#6d5648]">معلوماتك</span>
          </h2>
          <label className="mt-3 block text-sm font-semibold text-[#4d4039]">
            Full name <span lang="ar" dir="rtl" className="font-normal">/ الاسم الكامل</span>
            <input
              className={inputClass}
              name="fullName"
              autoComplete="name"
              required
              value={customer.fullName}
              onChange={(event) => setCustomer((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>
          <label className="mt-3 block text-sm font-semibold text-[#4d4039]">
            Phone number <span lang="ar" dir="rtl" className="font-normal">/ رقم الهاتف</span>
            <input
              className={inputClass}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={customer.phone}
              onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>

          {formError ? (
            <p className="mt-3 bg-[#8a4545]/10 px-3 py-2 text-sm leading-5 text-[#8a4545]" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canBook}
            className="mt-4 flex min-h-[3.75rem] w-full flex-col items-center justify-center bg-[#bd736b] px-4 py-2 text-center text-white shadow-[0_12px_24px_rgba(189,115,107,0.26)] transition hover:bg-[#a9615b] disabled:cursor-not-allowed disabled:bg-[#7d726d]/45 disabled:shadow-none"
          >
            <span className="text-lg font-semibold">
              {isSubmitting ? "Booking…" : `Book · ${formatServicePrice(totalPrice)}`}
              {!isSubmitting ? <span lang="ar" dir="rtl" className="ms-2 font-normal">احجزي</span> : null}
            </span>
            <span className="text-sm text-white/90">
              {selectedSlot && selectedDateIso
                ? `${formatShortDate(selectedDateIso)}, ${selectedSlot.label}`
                : availabilityLoading
                  ? "Loading free times…"
                  : "Pick a time above"}
            </span>
          </button>
          <p className="mt-2 text-center text-xs text-[#6d5648]">No account needed.</p>
        </section>
      </form>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#231814]/28 px-4 py-10 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="success-popup relative w-full max-w-[22rem] bg-[#d68599] px-6 pb-6 pt-10 text-center text-white shadow-[0_24px_70px_rgba(97,58,24,0.28)]">
            <span className="success-popup-icon absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center border-4 border-white bg-[#d68599] text-3xl font-semibold leading-none text-white shadow-[0_12px_28px_rgba(97,58,24,0.2)]">
              ✓
            </span>
            <h2 className="font-display text-[1.8rem] font-semibold leading-tight text-white">You're booked!</h2>
            <p lang="ar" dir="rtl" className="mt-1 text-base text-white/90">تم تأكيد حجزك</p>
            {successDetails ? (
              <p className="mt-3 text-sm leading-6 text-white/90">
                {successDetails.serviceName}
                {successDetails.addOnNames.length > 0 ? ` + ${successDetails.addOnNames.join(" + ")}` : ""}
                <br />
                {successDetails.date} at {successDetails.time}
                <br />
                {successDetails.totalPrice} · {successDetails.totalDuration}
              </p>
            ) : null}
            {successDetails ? (
              <a
                href={buildCalendarFileUrl({
                  id: successDetails.appointmentId,
                  title: `Pastel: ${successDetails.serviceName}`,
                  startIso: successDetails.startIso,
                  durationMinutes: successDetails.durationMinutes,
                  details: [successDetails.serviceName, ...successDetails.addOnNames].join(" + ") + ` · ${successDetails.totalPrice}`,
                })}
                download="pastel-appointment.ics"
                className="mt-5 flex min-h-12 items-center justify-center gap-2 bg-white px-5 text-sm font-semibold text-[#b46f65]"
              >
                Add to my calendar
                <span lang="ar" dir="rtl" className="font-normal">أضيفي إلى التقويم</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-3 min-h-11 w-full border border-white/70 px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
