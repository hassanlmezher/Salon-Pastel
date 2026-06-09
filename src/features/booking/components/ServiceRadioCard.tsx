import { motion, useReducedMotion } from "framer-motion";
import { Clock3, PoundSterling, Sparkles } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { currency } from "../../../lib/format";
import { cn } from "../../../lib/cn";
import type { Service } from "../types";

export function ServiceRadioCard({
  service,
  checked,
  onChange,
}: {
  service: Service;
  checked: boolean;
  onChange: (serviceId: string) => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.label
      layout
      whileHover={reducedMotion ? undefined : { y: -3 }}
      whileTap={reducedMotion ? undefined : { scale: 0.992 }}
      className="block cursor-pointer"
    >
      <input
        type="radio"
        className="sr-only"
        name="service"
        checked={checked}
        onChange={() => onChange(service.id)}
      />
      <Card
        className={cn(
          "relative overflow-hidden p-6 transition duration-200 sm:p-7",
          checked
            ? "window-panel border-gold-deep shadow-luxe"
            : "bg-surface hover:border-gold-soft/80",
        )}
      >
        <div className="mb-6 h-28 rounded-[24px] bg-[linear-gradient(135deg,rgba(201,162,123,0.36),rgba(255,255,255,0.88),rgba(61,43,31,0.12))]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge>{service.accent}</Badge>
            <h3 className="mt-4 font-display text-[32px] leading-none text-text sm:text-[40px]">
              {service.name}
            </h3>
          </div>
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-[14px] border",
              checked ? "border-gold-deep bg-gold-rich text-white" : "border-stroke bg-surface text-transparent",
            )}
          >
            <Sparkles size={16} aria-hidden="true" />
          </div>
        </div>
        <p className="mt-5 text-base leading-8 text-text-secondary">{service.description}</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-text-secondary">{service.featuredNote}</p>
        <div className="mt-7 flex flex-wrap gap-3 border-t border-stroke/80 pt-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-stroke/75 bg-surface px-4 py-2 text-sm text-text">
            <PoundSterling size={16} aria-hidden="true" />
            {currency(service.price)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-stroke/75 bg-surface px-4 py-2 text-sm text-text">
            <Clock3 size={16} aria-hidden="true" />
            {service.durationMin} min
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-stroke/75 bg-surface px-4 py-2 text-sm text-text">
            Book now
          </span>
        </div>
      </Card>
    </motion.label>
  );
}
