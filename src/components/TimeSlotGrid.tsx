import { motion } from "framer-motion";
import { PeriodIcon } from "./Icons";
import type { DateAvailability } from "../types";

type TimeSlotGridProps = {
  availability: DateAvailability | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export function TimeSlotGrid({
  availability,
  selectedTime,
  onSelectTime,
}: TimeSlotGridProps) {
  if (!availability) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 text-taupe shadow-soft">
        Select a date to reveal appointment times.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {availability.slots.map((group, groupIndex) => (
        <motion.section
          key={group.period}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.08 }}
          className="rounded-[2rem] border border-white/70 bg-white/60 p-5 shadow-soft backdrop-blur-xl sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-gold-100 bg-gold-50 text-gold-600">
              <PeriodIcon period={group.period} />
            </div>
            <div>
              <h2 className="font-display text-3xl leading-none text-ink">
                {group.period} Availability
              </h2>
              <p className="mt-1 text-sm text-taupe">
                Select the time that best suits your schedule.
              </p>
            </div>
          </div>

          <div
            className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            role="radiogroup"
            aria-label={`${group.period} time slots`}
          >
            {group.times.map((time, index) => {
              const isSelected = selectedTime === time;

              return (
                <motion.button
                  key={time}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.08 + index * 0.03 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectTime(time)}
                  className={[
                    "rounded-2xl border px-4 py-4 text-center text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300",
                    isSelected
                      ? "border-gold-300 bg-gold-gradient text-white shadow-float"
                      : "border-white/80 bg-white/85 text-ink hover:border-gold-200 hover:bg-white",
                  ].join(" ")}
                >
                  {time}
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
