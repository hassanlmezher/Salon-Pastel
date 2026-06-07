import { motion } from "framer-motion";
import { CalendarIcon } from "./Icons";
import { formatMonthLabel } from "../lib/format";

type DatePickerProps = {
  selectedDate: string | null;
  monthDate: Date;
  availabilityMap: Set<string>;
  onMonthChange: (direction: number) => void;
  onSelectDate: (iso: string) => void;
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + index);

    const iso = `${cellDate.getFullYear()}-${`${cellDate.getMonth() + 1}`.padStart(2, "0")}-${`${cellDate.getDate()}`.padStart(2, "0")}`;

    return {
      iso,
      day: cellDate.getDate(),
      inMonth: cellDate.getMonth() === month,
    };
  });
}

export function DatePicker({
  selectedDate,
  monthDate,
  availabilityMap,
  onMonthChange,
  onSelectDate,
}: DatePickerProps) {
  const days = getCalendarDays(monthDate);

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-luxe backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-gold-100 bg-gold-50 text-gold-600">
            <CalendarIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Availability
            </p>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              {formatMonthLabel(monthDate)}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/90 text-ink transition hover:border-gold-200 hover:text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            aria-label="Previous month"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/90 text-ink transition hover:border-gold-200 hover:text-gold-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            aria-label="Next month"
          >
            &#8594;
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.28em] text-taupe/70 sm:gap-3">
        {weekdays.map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>

      <div
        className="mt-2 grid grid-cols-7 gap-2 sm:gap-3"
        role="radiogroup"
        aria-label="Available appointment dates"
      >
        {days.map((day) => {
          const isAvailable = availabilityMap.has(day.iso);
          const isSelected = selectedDate === day.iso;

          return (
            <motion.button
              key={day.iso}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              whileHover={isAvailable ? { y: -2 } : undefined}
              whileTap={isAvailable ? { scale: 0.96 } : undefined}
              onClick={() => onSelectDate(day.iso)}
              className={[
                "relative aspect-square rounded-2xl border text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300",
                day.inMonth ? "" : "opacity-30",
                isSelected
                  ? "border-gold-300 bg-gold-gradient text-white shadow-float"
                  : isAvailable
                    ? "border-white/70 bg-white/85 text-ink hover:border-gold-200 hover:bg-white"
                    : "cursor-not-allowed border-transparent bg-transparent text-taupe/35",
              ].join(" ")}
            >
              {isAvailable && !isSelected ? (
                <span className="absolute inset-x-0 top-2 mx-auto h-1.5 w-1.5 rounded-full bg-gold-300" />
              ) : null}
              <span className="font-medium">{day.day}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-taupe">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-gold-300" />
          Available days
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[rgba(170,126,39,0.9)]" />
          Selected
        </span>
      </div>
    </div>
  );
}
