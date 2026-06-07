import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CalendarIcon, CheckIcon, ClockIcon, PriceIcon, SparkleIcon } from "./Icons";
import { formatCurrency, formatDateLabel } from "../lib/format";
import type { Service } from "../types";

type BookingSummaryProps = {
  service: Service | null;
  date: string | null;
  time: string | null;
  onConfirm?: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function BookingSummary({
  service,
  date,
  time,
  onConfirm,
  disabled = false,
  compact = false,
}: BookingSummaryProps) {
  return (
    <motion.aside
      layout
      className={[
        "rounded-[2rem] border border-white/70 bg-white/70 shadow-luxe backdrop-blur-xl",
        compact ? "p-5" : "p-6 sm:p-7",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold-600">
            Booking summary
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-ink">
            Your session
          </h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold-100 bg-gold-50 text-gold-600">
          <SparkleIcon />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SummaryRow
          icon={<SparkleIcon />}
          label="Service"
          value={service?.name ?? "Choose a service"}
          supporting={
            service ? `${service.duration} min curated treatment` : "Select a treatment to continue"
          }
        />
        <SummaryRow
          icon={<CalendarIcon />}
          label="Date"
          value={date ? formatDateLabel(date) : "Choose a date"}
          supporting={date ? "Reserved softly until you confirm" : "Available dates shown in the calendar"}
        />
        <SummaryRow
          icon={<ClockIcon />}
          label="Time"
          value={time ?? "Choose a time"}
          supporting={time ? "Arrival window opens 10 minutes prior" : "Morning, afternoon, and evening slots"}
        />
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-gold-100 bg-gold-50/80 p-5">
        <div className="flex items-center gap-2 text-gold-600">
          <PriceIcon className="h-4 w-4" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
            Total investment
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-4xl text-ink">
              {service ? formatCurrency(service.price) : "--"}
            </p>
            <p className="mt-1 text-sm text-taupe">
              Complimentary consultation included
            </p>
          </div>
          {service ? (
            <span className="rounded-full border border-gold-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
              {service.duration} min
            </span>
          ) : null}
        </div>
      </div>

      {onConfirm ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className={[
            "mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300",
            disabled
              ? "cursor-not-allowed bg-stone-200 text-stone-400"
              : "bg-gold-gradient text-white shadow-luxe hover:-translate-y-0.5",
          ].join(" ")}
        >
          <CheckIcon className="h-4 w-4" />
          Confirm appointment
        </button>
      ) : null}
    </motion.aside>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  supporting,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  supporting: string;
}) {
  return (
    <div className="flex gap-4 rounded-[1.4rem] border border-white/80 bg-white/65 p-4">
      <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-gold-100 bg-gold-50 text-gold-600">
        {icon}
      </div>
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
          {label}
        </p>
        <p className="mt-2 font-display text-2xl leading-none text-ink">{value}</p>
        <p className="mt-2 text-sm leading-6 text-taupe">{supporting}</p>
      </div>
    </div>
  );
}
