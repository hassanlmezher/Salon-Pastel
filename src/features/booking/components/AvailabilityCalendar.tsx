import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { monthLabel } from "../../../lib/format";
import { cn } from "../../../lib/cn";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AvailabilityCalendar({
  selectedDate,
  availableDates,
  onSelectDate,
}: {
  selectedDate: string | null;
  availableDates: string[];
  onSelectDate: (dateIso: string) => void;
}) {
  const initialMonth = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date("2026-06-01T12:00:00");
  const [month, setMonth] = useState(initialMonth);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <Card className="paper-panel p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gold-rich text-white">
            <CalendarDays size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-[32px] leading-none text-text">Choose a day</h2>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              Choose a day and we will show the best available times instantly.
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            className="grid h-11 w-11 place-items-center rounded-[16px] border border-stroke bg-surface text-text"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="grid h-11 w-11 place-items-center rounded-[16px] border border-stroke bg-surface text-text"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          className="grid h-10 w-10 place-items-center rounded-[14px] border border-stroke bg-surface"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-rich">{monthLabel(month)}</p>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="grid h-10 w-10 place-items-center rounded-[14px] border border-stroke bg-surface"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-4 hidden text-sm font-semibold uppercase tracking-[0.2em] text-gold-rich sm:block">
        {monthLabel(month)}
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
        {weekdays.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2" role="grid" aria-label="Availability calendar">
        {days.map((day) => {
          const dateIso = day.toISOString().slice(0, 10);
          const available = availableDates.includes(dateIso);
          const selected = selectedDate === dateIso;
          return (
            <button
              key={dateIso}
              type="button"
              disabled={!available}
              onClick={() => onSelectDate(dateIso)}
              className={cn(
                "aspect-square rounded-[18px] border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-rich",
                !isSameMonth(day, month) && "opacity-35",
                selected && "border-gold-deep bg-gold-rich text-white shadow-float",
                available && !selected && "border-stroke bg-surface text-text hover:border-gold-soft/70",
                !available && "cursor-not-allowed border-transparent bg-transparent text-text-secondary/35",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
