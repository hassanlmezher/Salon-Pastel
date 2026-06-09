import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../lib/cn";
import type { AvailabilitySlot } from "../types";

export function TimeSlotGrid({
  slots,
  selectedSlotIso,
  onSelect,
}: {
  slots: AvailabilitySlot[];
  selectedSlotIso: string | null;
  onSelect: (slot: AvailabilitySlot) => void;
}) {
  const groups = {
    Morning: slots.filter((slot) => slot.period === "Morning"),
    Afternoon: slots.filter((slot) => slot.period === "Afternoon"),
    Evening: slots.filter((slot) => slot.period === "Evening"),
  };

  return (
    <Card className="paper-panel p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gold-rich text-white">
          <Clock3 size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-[32px] leading-none text-text">Choose a time</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            All appointment times are shown in the salon’s local time.
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {Object.entries(groups).map(([label, group]) =>
          group.length > 0 ? (
            <section key={label}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-rich">{label}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {group.map((slot) => {
                  const selected = selectedSlotIso === slot.startIso;
                  return (
                    <motion.button
                      key={slot.startIso}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => onSelect(slot)}
                      className={cn(
                        "rounded-[18px] border px-4 py-4 text-center text-sm font-semibold tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-rich",
                        selected
                          ? "border-gold-deep bg-gold-rich text-white shadow-soft"
                          : "border-stroke bg-surface text-text hover:border-gold-soft/70",
                      )}
                    >
                      {slot.label}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ) : null,
        )}
      </div>
    </Card>
  );
}
