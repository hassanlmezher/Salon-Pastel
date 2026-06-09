import { cn } from "../../../lib/cn";
import type { BookingStep } from "../types";

const steps: { id: BookingStep; label: string; index: number }[] = [
  { id: "service", label: "Service", index: 1 },
  { id: "schedule", label: "Date & time", index: 2 },
  { id: "review", label: "Review", index: 3 },
];

export function ProgressStepper({ current }: { current: BookingStep }) {
  const currentIndex = steps.find((step) => step.id === current)?.index ?? 1;

  return (
    <nav aria-label="Booking progress" className="window-panel rounded-[30px] border border-stroke/90 p-3 backdrop-blur-sm">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const active = step.id === current;
          const complete = step.index < currentIndex;
          return (
            <li key={step.id}>
              <div
                aria-current={active ? "step" : undefined}
                className={cn(
                  "rounded-[22px] border px-3 py-4 text-left transition",
                  active && "border-gold-deep bg-gold-rich text-white shadow-soft",
                  complete && "border-stroke/60 bg-surface text-text",
                  !active && !complete && "border-transparent bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold",
                    active ? "border-white/15 bg-white/10 text-gold-soft" : "border-stroke bg-surface text-gold-rich",
                  )}
                >
                  {step.index}
                </span>
                <span
                  className={cn(
                    "mt-3 block text-[11px] font-semibold uppercase tracking-[0.24em]",
                    active ? "text-gold-soft" : "text-gold-rich",
                  )}
                >
                  {complete ? "Completed" : active ? "Current step" : "Up next"}
                </span>
                <span className={cn("mt-1 block text-sm font-medium", active ? "text-white" : "text-text")}>
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
