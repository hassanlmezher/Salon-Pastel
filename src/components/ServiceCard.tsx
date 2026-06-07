import { motion } from "framer-motion";
import { ClockIcon, PriceIcon, ServiceIcon, SparkleIcon } from "./Icons";
import { formatCurrency } from "../lib/format";
import type { Service } from "../types";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  onSelect: (serviceId: string) => void;
};

export function ServiceCard({
  service,
  selected,
  onSelect,
}: ServiceCardProps) {
  return (
    <motion.button
      layout
      type="button"
      role="radio"
      aria-checked={selected}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onSelect(service.id)}
      className={[
        "group relative flex h-full flex-col rounded-[2rem] border p-6 text-left shadow-soft transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f0e9]",
        selected
          ? "border-gold-300 bg-white shadow-luxe"
          : "border-white/70 bg-white/70 hover:border-gold-200 hover:bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={[
              "grid h-11 w-11 place-items-center rounded-2xl border transition-colors",
              selected
                ? "border-gold-200 bg-gold-50 text-gold-600"
                : "border-white bg-white text-gold-500",
            ].join(" ")}
          >
            <ServiceIcon icon={service.icon} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
              {service.accent}
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-ink">
              {service.name}
            </h2>
          </div>
        </div>
        <div
          className={[
            "mt-1 grid h-7 w-7 place-items-center rounded-full border transition-all",
            selected
              ? "border-gold-500 bg-gold-500 text-white"
              : "border-gold-200 text-transparent group-hover:border-gold-400",
          ].join(" ")}
        >
          <SparkleIcon className="h-3.5 w-3.5" />
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-7 text-taupe sm:text-[0.95rem]">
        {service.description}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold-100 bg-gold-50/70 p-4">
          <div className="flex items-center gap-2 text-gold-600">
            <PriceIcon className="h-4 w-4" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
              Investment
            </span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">
            {service.id === "artistic-detailing" ? `+${formatCurrency(service.price)}` : formatCurrency(service.price)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-gold-600">
            <ClockIcon className="h-4 w-4" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
              Duration
            </span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{service.duration} min</p>
        </div>
      </div>
    </motion.button>
  );
}
