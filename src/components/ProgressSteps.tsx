import { motion } from "framer-motion";
import type { BookingStep } from "../types";

const steps = [
  { id: 0, title: "Services" },
  { id: 1, title: "Date" },
  { id: 2, title: "Time" },
] as const;

export function ProgressSteps({ currentStep }: { currentStep: BookingStep }) {
  return (
    <div className="rounded-full border border-white/70 bg-white/55 p-2 shadow-soft backdrop-blur-xl">
      <ol className="grid grid-cols-3 gap-2" aria-label="Booking steps">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep || currentStep === 3;

          return (
            <li key={step.id}>
              <div
                className={[
                  "relative overflow-hidden rounded-full px-4 py-3 text-center",
                  isActive || isComplete ? "text-ink" : "text-taupe/70",
                ].join(" ")}
              >
                <motion.span
                  className={[
                    "absolute inset-0 rounded-full",
                    isActive
                      ? "bg-gradient-to-r from-gold-100 via-white to-gold-50"
                      : isComplete
                        ? "bg-white/85"
                        : "bg-transparent",
                  ].join(" ")}
                  initial={false}
                  animate={{ opacity: isActive || isComplete ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
                <span className="relative block text-[0.65rem] font-semibold uppercase tracking-[0.28em]">
                  Step {step.id + 1}
                </span>
                <span className="relative mt-1 block font-display text-lg">
                  {step.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
