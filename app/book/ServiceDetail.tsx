"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createAppointment,
  fetchAvailableSlotsForMonth,
  fetchServiceBySlug,
  getBookingErrorMessage,
  type AvailableSlot,
} from "../../src/features/booking/data/supabaseBooking";
import {
  formatServiceDuration,
  getServiceAddOns,
  getOptimizedServiceImage,
  getServiceArabicCopy,
  getServiceInclusions,
  parseServiceDuration,
  parseServicePrice,
  type ServiceGroupId,
  type ServiceAddOnOption,
  type ServiceMenuItem,
} from "../../src/features/booking/data/serviceMenu";
import {
  requestAppointmentReminderSubscription,
  type ReminderSubscriptionResult,
} from "../../src/features/booking/pwa/reminders";

type ServiceDetailProps = {
  groupId: ServiceGroupId;
  serviceSlug: string;
  initialService?: ServiceMenuItem | null;
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

function formatServicePrice(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export function ServiceDetail({ groupId, serviceSlug, initialService = null }: ServiceDetailProps) {
  const router = useRouter();
  const monthOptions = useMemo(() => createMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [service, setService] = useState<ServiceMenuItem | null>(initialService);
  const [serviceLoading, setServiceLoading] = useState(!initialService);
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
      if (initialService?.slug === serviceSlug && initialService.id) {
        setService(initialService);
        setServiceError("");
        setServiceLoading(false);
        return;
      }

      try {
        setServiceLoading(!initialService);
        setServiceError("");
        const activeService = await fetchServiceBySlug(groupId, serviceSlug);
        if (!isCurrent) return;

        if (!activeService?.id) {
          setService(initialService?.slug === serviceSlug ? initialService : null);
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
  }, [groupId, initialService, serviceSlug]);

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

  const availableAddOns = useMemo(
    () => (service ? getServiceAddOns(groupId, service.slug) : []),
    [groupId, service],
  );

  const selectedAddOns = useMemo(
    () => availableAddOns.filter((addOn) => selectedAddOnSlugs.includes(addOn.slug)),
    [availableAddOns, selectedAddOnSlugs],
  );

  const serviceInclusions = useMemo(
    () => (service ? getServiceInclusions(service.slug) : []),
    [service],
  );

  const totalPrice = useMemo(() => {
    const servicePrice = service ? parseServicePrice(service.price) : 0;
    return servicePrice + selectedAddOns.reduce((total, addOn) => total + addOn.priceValue, 0);
  }, [selectedAddOns, service]);

  const totalDurationMin = useMemo(() => {
    const serviceDuration = service ? parseServiceDuration(service.duration) : 0;
    return serviceDuration + selectedAddOns.reduce((total, addOn) => total + addOn.durationMin, 0);
  }, [selectedAddOns, service]);

  useEffect(() => {
    setSelectedAddOnSlugs([]);
  }, [service?.slug]);

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
      <main className="appointmentPage">
        <div className="appointmentInner">
          <div className="appointmentPageState">
            <a className="serviceMenuBack" href={`/book/${groupId}`} aria-label="Go back">
              ←
            </a>
            <p>{serviceLoading ? "Loading service..." : serviceError}</p>
          </div>
        </div>
      </main>
    );
  }

  const arabicCopy = getServiceArabicCopy(service.slug);
  const totalPriceText = formatServicePrice(totalPrice);
  const totalDurationText = formatServiceDuration(totalDurationMin);

  return (
    <main className="appointmentPage">
      <div className="appointmentInner">
        <section className="appointmentHero">
          <div className="appointmentImagePane">
            <img src={getOptimizedServiceImage(service.imageSrc)} alt={service.name} fetchPriority="high" />
            <a className="appointmentBack" href={`/book/${groupId}`} aria-label="Go back">
              <span aria-hidden="true">←</span>
            </a>
            <div className="appointmentServiceOverlay">
              <h1>
                <span>{service.name}</span>
                <span lang="ar" dir="rtl">
                  {arabicCopy.title}
                </span>
              </h1>
              <div className="appointmentServiceMeta">
                <strong>{totalPriceText}</strong>
                <span>{totalDurationText}</span>
              </div>
              <p>{service.description}</p>
              {serviceInclusions.length > 0 ? (
                <div className="appointmentIncludedList">
                  {serviceInclusions.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="appointmentInfoPane">
            <div className="appointmentExtrasHeader">
              <div>
                <p>Available extra services</p>
                <h2>Customize your appointment</h2>
              </div>
              <div className="appointmentStickyQuote" aria-live="polite">
                <span>Total</span>
                <strong>{totalPriceText}</strong>
                <em>{totalDurationText}</em>
              </div>
            </div>

            {availableAddOns.length > 0 ? (
              <div className="appointmentAddonGrid">
                {availableAddOns.map((addOn) => {
                  const selected = selectedAddOnSlugs.includes(addOn.slug);

                  return (
                    <button
                      key={addOn.slug}
                      type="button"
                      className={`appointmentAddonCard ${selected ? "selected" : ""}`}
                      onClick={() => toggleAddOn(addOn)}
                      aria-pressed={selected}
                    >
                      <img src={getOptimizedServiceImage(addOn.imageSrc)} alt="" aria-hidden="true" />
                      <span className="appointmentAddonContent">
                        <strong>{addOn.name}</strong>
                        <span>
                          {addOn.price} / {addOn.duration}
                        </span>
                        <small>{addOn.description}</small>
                      </span>
                      <span className="appointmentAddonToggle" aria-hidden="true">
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="appointmentNoAddons">
                <strong>This service is booked alone.</strong>
                <span>No extra services are available with this appointment.</span>
              </div>
            )}

            <div className="appointmentFacts">
              <Fact icon="◷" label="Total duration" arabicLabel="المدة" value={totalDurationText} />
              <Fact icon="▣" label="Service type" arabicLabel="نوع الخدمة" value={service.serviceType} />
            </div>

            <div className="appointmentTotalBar">
              <span>Total</span>
              <strong>
                {totalPriceText} / {totalDurationText}
              </strong>
            </div>
          </div>
        </section>

        <section className="appointmentPanel">
          <h2>Select Your Appointment</h2>

          <AppointmentStep icon="□" number="1" title="Choose Month">
            <div className="appointmentMonthGrid">
              {monthOptions.map((item) => (
                <button
                  key={`${item.month}-${item.year}`}
                  type="button"
                  onClick={() => chooseMonth(item)}
                  className={selectedMonth.monthIndex === item.monthIndex && selectedMonth.year === item.year ? "selected" : ""}
                >
                  <span>{item.month}</span>
                  <span>{item.year}</span>
                </button>
              ))}
            </div>
          </AppointmentStep>

          <AppointmentStep icon="□" number="2" title="Choose Day">
            {availabilityLoading ? <p className="appointmentInlineState">Loading available days...</p> : null}
            {!availabilityLoading && availabilityError ? <p className="appointmentError">{availabilityError}</p> : null}
            {!availabilityLoading && !availabilityError ? (
              <div className="appointmentDayGrid">
                {days.map((day) => {
                  const disabled = day.available === 0;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDateIso(day.dateIso)}
                      className={`${disabled ? "unavailable" : ""} ${selectedDateIso === day.dateIso ? "selected" : ""}`}
                    >
                      <span>{day.weekday}</span>
                      <strong>{day.day}</strong>
                      <small>{disabled ? "No availability" : `${day.available} available`}</small>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </AppointmentStep>

          <AppointmentStep icon="◷" number="3" title="Choose Time">
            {availabilityLoading ? <p className="appointmentInlineState">Loading available times...</p> : null}
            {!availabilityLoading && selectedDateIso && selectedDaySlots.length === 0 ? (
              <p className="appointmentInlineState">No available times for this day.</p>
            ) : null}
            {!availabilityLoading && selectedDaySlots.length > 0 ? (
              <div className="appointmentTimeGrid">
                {selectedDaySlots.map((slot) => (
                  <button
                    key={slot.startIso}
                    type="button"
                    onClick={() => setSelectedSlotStart(slot.startIso)}
                    className={selectedSlotStart === slot.startIso ? "selected" : ""}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            ) : null}
          </AppointmentStep>

          <button
            className="appointmentContinue"
            type="button"
            disabled={availabilityLoading || !selectedSlot}
            onClick={() => setShowCustomerForm(true)}
          >
            <span className="appointmentContinueText">
              <span>Continue to Booking</span>
              <span lang="ar" dir="rtl">
                تابع الحجز
              </span>
            </span>
            <span className="appointmentContinueArrow" aria-hidden="true">
              →
            </span>
          </button>
        </section>
      </div>

      {showCustomerForm ? (
        <div className="appointmentFormOverlay" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
          <form className="appointmentFormPopup" onSubmit={submitCustomerForm}>
            <h2 id="customer-form-title">Confirm your details</h2>
            <p>Enter your contact information so we can confirm your appointment.</p>

            <label>
              <span className="appointmentFormLabelText">
                <span>First name</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  الاسم الأول
                </span>
              </span>
              <input name="firstName" autoComplete="given-name" required />
            </label>
            <label>
              <span className="appointmentFormLabelText">
                <span>Last name</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  اسم العائلة
                </span>
              </span>
              <input name="lastName" autoComplete="family-name" required />
            </label>
            <label>
              <span className="appointmentFormLabelText">
                <span>Phone number</span>
                <span aria-hidden="true">/</span>
                <span lang="ar" dir="rtl">
                  رقم الهاتف
                </span>
              </span>
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>

            {formError ? <p className="appointmentError">{formError}</p> : null}

            <div className="appointmentFormActions">
              <button type="button" onClick={() => setShowCustomerForm(false)} disabled={isSubmitting}>
                <span className="appointmentFormButtonText">
                  <span>Back</span>
                  <span lang="ar" dir="rtl">
                    رجوع
                  </span>
                </span>
              </button>
              <button type="submit" disabled={isSubmitting}>
                <span className="appointmentFormButtonText">
                  <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
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
        <div className="appointmentSuccessOverlay" role="status" aria-live="polite">
          <div className="appointmentSuccessPopup">
            <span aria-hidden="true">✓</span>
            <h2>Appointment booked successfully.</h2>
            {successDetails ? (
              <p>
                {successDetails.serviceName}
                {successDetails.addOnNames.length > 0 ? ` + ${successDetails.addOnNames.join(" + ")}` : ""}
                <br />
                {successDetails.totalPrice} / {successDetails.totalDuration}
                <br />
                {successDetails.date} at {successDetails.time}
                <br />
                Phone: {successDetails.phone}
              </p>
            ) : (
              <p>Thank you. Your appointment request has been received.</p>
            )}
            {successDetails ? (
              <div className="appointmentReminderActions">
                <button type="button" onClick={enableReminders} disabled={reminderStatus === "loading" || reminderStatus === "success"}>
                  {reminderStatus === "loading" ? "Enabling..." : "Enable appointment reminders"}
                </button>
                {reminderMessage ? (
                  <p className={`appointmentReminderMessage ${reminderStatus === "error" ? "error" : ""}`}>
                    {reminderMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
            <button type="button" className="appointmentDoneButton" onClick={() => router.push("/")}>
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Fact({ icon, label, arabicLabel, value }: { icon: string; label: string; arabicLabel: string; value: string }) {
  return (
    <div className="appointmentFact">
      <span>{icon}</span>
      <div>
        <small>
          <span>{label}</span>
          <span aria-hidden="true">/</span>
          <span lang="ar" dir="rtl">
            {arabicLabel}
          </span>
        </small>
        <p>{value}</p>
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
    <div className="appointmentStep">
      <span className="appointmentStepIcon">{icon}</span>
      <div>
        <h3>
          {number}. {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
