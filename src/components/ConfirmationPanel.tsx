import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CalendarIcon, CheckIcon, ClockIcon, SparkleIcon } from "./Icons";
import { formatDateLabel } from "../lib/format";
import type { Service } from "../types";

type ConfirmationPanelProps = {
  service: Service | null;
  date: string | null;
  time: string | null;
  onReset: () => void;
};

export function ConfirmationPanel({
  service,
  date,
  time,
  onReset,
}: ConfirmationPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl rounded-[2.4rem] border border-white/70 bg-white/80 p-7 text-center shadow-luxe backdrop-blur-xl sm:p-10"
    >
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gold-gradient text-white shadow-luxe">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          className="grid h-16 w-16 place-items-center rounded-full border border-white/35 bg-white/15"
        >
          <CheckIcon className="h-9 w-9" />
        </motion.div>
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.36em] text-gold-600">
        Appointment confirmed
      </p>
      <h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl">
        Your salon moment is reserved.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-taupe sm:text-lg">
        A confirmation email and care notes would normally be sent next. For now, this is a polished frontend-only confirmation state.
      </p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <DetailCard
          icon={<SparkleIcon />}
          label="Service"
          value={service?.name ?? "Service pending"}
        />
        <DetailCard
          icon={<CalendarIcon />}
          label="Date"
          value={date ? formatDateLabel(date) : "Date pending"}
        />
        <DetailCard
          icon={<ClockIcon />}
          label="Time"
          value={time ?? "Time pending"}
        />
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-gold-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-ink transition hover:-translate-y-0.5 hover:border-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
        >
          Book another service
        </button>
        <span className="rounded-full border border-white/80 bg-white/75 px-5 py-3 text-sm text-taupe">
          Private appointments available daily from 9 AM to 7 PM
        </span>
      </div>
    </motion.section>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/65 p-5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-gold-100 bg-gold-50 text-gold-600">
        {icon}
      </div>
      <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl leading-none text-ink">{value}</p>
    </div>
  );
}
