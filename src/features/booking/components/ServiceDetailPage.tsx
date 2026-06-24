import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ServiceGroupId, ServiceMenuItem } from "../data/serviceMenu";

type ServiceDetailPageProps = {
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

export function ServiceDetailPage({ groupId, service }: ServiceDetailPageProps) {
  const firstAvailableTime = useMemo(() => times.find((time) => time.available)?.label ?? "", []);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5);
  const [selectedDay, setSelectedDay] = useState(() => getFirstAvailableDay(5));
  const [selectedTime, setSelectedTime] = useState(firstAvailableTime);
  const days = useMemo(() => getDaysForMonth(selectedMonthIndex), [selectedMonthIndex]);

  const chooseMonth = (monthIndex: number) => {
    setSelectedMonthIndex(monthIndex);
    setSelectedDay(getFirstAvailableDay(monthIndex));
  };

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
            <h1 className="font-display text-[2.1rem] font-semibold leading-tight text-[#231814] sm:text-[2.7rem]">
              {service.name}
            </h1>
            <p className="mt-4 text-[2rem] font-medium leading-none text-[#b46f65]">
              {service.price}
            </p>
            <p className="mt-5 max-w-md text-base leading-7 text-[#4d4039]">
              {service.description}
            </p>

            <div className="mt-6 grid gap-4">
              <DetailRow icon="◷" label="Duration" value={service.duration} />
              <DetailRow icon="▣" label="Service type" value={service.serviceType} />
            </div>
          </div>
        </section>

        <section className="service-detail-panel mt-5 bg-[#fffaf6] p-5 shadow-[0_18px_44px_rgba(97,58,24,0.1)] sm:p-6 lg:p-8">
          <h2 className="font-display text-[1.75rem] font-semibold leading-none text-[#231814] sm:text-[2.25rem]">
            Select Your Appointment
          </h2>

          <AppointmentStep icon="□" number="1" title="Choose Month">
            <div className="flex gap-3 overflow-x-auto px-0.5 pb-2">
              {months.map((item) => (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => chooseMonth(item.monthIndex)}
                  className={`min-h-16 flex-[0_0_7.2rem] border px-3 text-center text-base leading-6 transition sm:flex-[0_0_8.25rem] ${
                    selectedMonthIndex === item.monthIndex
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
            <div className="flex gap-3 overflow-x-auto px-0.5 pb-2">
              {days.map((day) => {
                const disabled = day.available === 0;
                return (
                  <button
                    key={day.day}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDay(day.day)}
                    className={`min-h-24 flex-[0_0_5.85rem] border px-2 py-3 text-center transition sm:flex-[0_0_6.5rem] ${
                      disabled
                        ? "cursor-not-allowed border-dashed border-[#8c7c75] bg-[#7d726d]/20 text-[#5f514b]"
                        : selectedDay === day.day
                          ? "border-[#bd736b] bg-[#bd736b] text-white shadow-[0_8px_18px_rgba(97,58,24,0.08)]"
                          : "border-[#ead5cd] bg-white/50 text-[#231814] hover:border-[#bd736b]"
                    }`}
                  >
                    <span className={`block text-sm ${selectedDay === day.day && !disabled ? "text-white" : "text-[#756964]"}`}>
                      {day.weekday}
                    </span>
                    <span className="mt-1.5 block text-[1.75rem] leading-none">{day.day}</span>
                    <span className={`mt-2.5 block text-xs ${
                      selectedDay === day.day && !disabled ? "text-white" : disabled ? "text-[#5f514b]" : "text-[#a25b54]"
                    }`}>
                      {disabled ? "No availability" : `${day.available} available`}
                    </span>
                  </button>
                );
              })}
            </div>
          </AppointmentStep>

          <AppointmentStep icon="◷" number="3" title="Choose Time">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {times.map((time) => (
                <button
                  key={time.label}
                  type="button"
                  disabled={!time.available}
                  onClick={() => setSelectedTime(time.label)}
                  className={`min-h-[3.25rem] border px-3 text-base transition ${
                    !time.available
                      ? "cursor-not-allowed border-dashed border-[#8c7c75] bg-[#7d726d]/20 text-[#5f514b]"
                      : selectedTime === time.label
                        ? "border-[#bd736b] bg-[#bd736b] text-white"
                        : "border-[#ead5cd] bg-white/50 text-[#4d4039] hover:border-[#bd736b]"
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </AppointmentStep>

          <button
            type="button"
            className="mt-6 min-h-[3.75rem] w-full bg-[#bd736b] px-5 text-center font-display text-[1.35rem] text-white shadow-[0_14px_28px_rgba(189,115,107,0.28)] transition hover:bg-[#a9615b] sm:text-[1.65rem]"
          >
            Continue to Booking →
          </button>
        </section>
      </div>
    </main>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="service-detail-icon grid h-11 w-11 place-items-center bg-[#f2e7e2] text-lg text-[#a25b54]">
        {icon}
      </span>
      <div>
        <p className="text-sm text-[#6d5648]">{label}</p>
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
