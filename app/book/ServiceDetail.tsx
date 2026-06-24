"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ServiceGroupId, ServiceMenuItem } from "../../src/features/booking/data/serviceMenu";

type ServiceDetailProps = {
  groupId: ServiceGroupId;
  service: ServiceMenuItem;
};

const bookingYear = 2026;
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((month, index) => ({ month, monthIndex: index, year: String(bookingYear) }));

function getDaysForMonth(monthIndex: number) {
  const daysInMonth = new Date(bookingYear, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const date = new Date(bookingYear, monthIndex, dayNumber);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const isClosed = weekday === "Sun" || dayNumber % 9 === 0;

    return {
      weekday,
      day: String(dayNumber),
      available: isClosed ? 0 : ((dayNumber + monthIndex) % 4) + 2,
    };
  });
}

function getFirstAvailableDay(monthIndex: number) {
  return getDaysForMonth(monthIndex).find((day) => day.available > 0)?.day ?? "";
}

const times = [
  { label: "9:00 AM", available: true },
  { label: "9:30 AM", available: true },
  { label: "10:00 AM", available: true },
  { label: "10:30 AM", available: true },
  { label: "11:00 AM", available: true },
  { label: "11:30 AM", available: true },
  { label: "12:00 PM", available: false },
  { label: "12:30 PM", available: true },
  { label: "1:00 PM", available: true },
  { label: "1:30 PM", available: true },
  { label: "2:00 PM", available: false },
  { label: "2:30 PM", available: true },
  { label: "3:00 PM", available: true },
  { label: "3:30 PM", available: false },
  { label: "4:00 PM", available: true },
];

export function ServiceDetail({ groupId, service }: ServiceDetailProps) {
  const router = useRouter();
  const firstAvailableTime = useMemo(() => times.find((time) => time.available)?.label ?? "", []);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5);
  const [selectedDay, setSelectedDay] = useState(() => getFirstAvailableDay(5));
  const [selectedTime, setSelectedTime] = useState(firstAvailableTime);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const days = useMemo(() => getDaysForMonth(selectedMonthIndex), [selectedMonthIndex]);

  const chooseMonth = (monthIndex: number) => {
    setSelectedMonthIndex(monthIndex);
    setSelectedDay(getFirstAvailableDay(monthIndex));
  };

  const submitCustomerForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowCustomerForm(false);
    setShowSuccess(true);
  };

  return (
    <main className="appointmentPage">
      <div className="appointmentInner">
        <section className="appointmentHero">
          <div className="appointmentImagePane">
            <img src={service.imageSrc} alt={service.name} />
            <a className="appointmentBack" href={`/book/${groupId}`}>
              <span>‹</span>
              Back
            </a>
          </div>

          <div className="appointmentInfoPane">
            <h1>{service.name}</h1>
            <p className="appointmentPrice">{service.price}</p>
            <p className="appointmentDescription">{service.description}</p>
            <div className="appointmentFacts">
              <Fact icon="◷" label="Duration" value={service.duration} />
              <Fact icon="▣" label="Service type" value={service.serviceType} />
            </div>
          </div>
        </section>

        <section className="appointmentPanel">
          <h2>Select Your Appointment</h2>

          <AppointmentStep icon="□" number="1" title="Choose Month">
            <div className="appointmentMonthGrid">
              {months.map((item) => (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => chooseMonth(item.monthIndex)}
                  className={selectedMonthIndex === item.monthIndex ? "selected" : ""}
                >
                  <span>{item.month}</span>
                  <span>{item.year}</span>
                </button>
              ))}
            </div>
          </AppointmentStep>

          <AppointmentStep icon="□" number="2" title="Choose Day">
            <div className="appointmentDayGrid">
              {days.map((day) => {
                const disabled = day.available === 0;
                return (
                  <button
                    key={day.day}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDay(day.day)}
                    className={`${disabled ? "unavailable" : ""} ${selectedDay === day.day ? "selected" : ""}`}
                  >
                    <span>{day.weekday}</span>
                    <strong>{day.day}</strong>
                    <small>{disabled ? "No availability" : `${day.available} available`}</small>
                  </button>
                );
              })}
            </div>
          </AppointmentStep>

          <AppointmentStep icon="◷" number="3" title="Choose Time">
            <div className="appointmentTimeGrid">
              {times.map((time) => (
                <button
                  key={time.label}
                  type="button"
                  disabled={!time.available}
                  onClick={() => setSelectedTime(time.label)}
                  className={`${!time.available ? "unavailable" : ""} ${selectedTime === time.label ? "selected" : ""}`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </AppointmentStep>

          <button className="appointmentContinue" type="button" onClick={() => setShowCustomerForm(true)}>
            Continue to Booking <span>→</span>
          </button>
        </section>
      </div>

      {showCustomerForm ? (
        <div className="appointmentFormOverlay" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
          <form className="appointmentFormPopup" onSubmit={submitCustomerForm}>
            <h2 id="customer-form-title">Confirm your details</h2>
            <p>Enter your contact information so we can confirm your appointment.</p>

            <label>
              First name
              <input name="firstName" autoComplete="given-name" required />
            </label>
            <label>
              Last name
              <input name="lastName" autoComplete="family-name" required />
            </label>
            <label>
              Phone number
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>

            <div className="appointmentFormActions">
              <button type="button" onClick={() => setShowCustomerForm(false)}>
                Back
              </button>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="appointmentSuccessOverlay" role="status" aria-live="polite">
          <div className="appointmentSuccessPopup">
            <span aria-hidden="true">✓</span>
            <h2>Appointment booked successfully.</h2>
            <p>Thank you. Your appointment request has been received.</p>
            <button type="button" onClick={() => router.push("/")}>
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="appointmentFact">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
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
