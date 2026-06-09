import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock3, PoundSterling, Sparkles, UserRound } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Chip } from "../../../components/ui/Chip";
import { currency, dateTimeLabel, shortDate, timeLabel } from "../../../lib/format";
import { addOns, services, staff } from "../data/catalogue";
import type { DraftBooking, Quote } from "../types";

export function BookingSummaryCard({
  draft,
  quote,
  timezone,
  compact,
  children,
}: {
  draft: DraftBooking;
  quote: Quote;
  timezone: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const service = services.find((item) => item.id === draft.serviceId) ?? null;
  const selectedAddOns = addOns.filter((item) => draft.addOnIds.includes(item.id));
  const selectedStaff = draft.staffId ? staff.find((item) => item.id === draft.staffId) ?? null : null;

  return (
    <Card className={compact ? "window-panel overflow-hidden p-5" : "window-panel overflow-hidden p-6 sm:p-7"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">Live summary</p>
          <h2 className="mt-2 font-display text-[36px] leading-none text-text">Review booking</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gold-rich text-white shadow-soft">
          <Sparkles size={18} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-5 space-y-3" aria-live="polite">
        <SummaryRow icon={<Sparkles size={16} />} label="Service" value={service?.name ?? "Choose your service"} />
        <SummaryRow
          icon={<CalendarDays size={16} />}
          label="Date"
          value={draft.selectedDate ? shortDate(draft.selectedDate) : "Choose a day"}
        />
        <SummaryRow
          icon={<Clock3 size={16} />}
          label="Time"
          value={draft.selectedSlotIso ? timeLabel(draft.selectedSlotIso, timezone) : "Choose a time"}
        />
        <SummaryRow
          icon={<UserRound size={16} />}
          label="Staff"
          value={selectedStaff?.name ?? "Any available"}
        />
      </div>
      {selectedAddOns.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {selectedAddOns.map((addOn) => (
            <Chip key={addOn.id} className="border-gold-soft/30 bg-gold-soft/10 text-gold-rich">{addOn.name}</Chip>
          ))}
        </div>
      ) : null}
      <div className="action-panel mt-6 rounded-[24px] p-4 text-white">
        <div className="flex items-center gap-2 text-gold-soft">
          <PoundSterling size={16} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Pricing</span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-white/74">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="text-white">{currency(quote.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Deposit due now</span>
            <span className="text-white">{quote.deposit > 0 ? currency(quote.deposit) : "None"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="font-semibold text-white">{currency(quote.total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration</span>
            <span className="text-white">{quote.durationMin} min</span>
          </div>
          {draft.selectedSlotIso ? (
            <div className="pt-2 text-xs text-white/58">
              Ends {dateTimeLabel(quote.endIso ?? draft.selectedSlotIso, timezone)}.
            </div>
          ) : null}
        </div>
      </div>
      <AnimatePresence>{children ? <motion.div layout className="mt-6">{children}</motion.div> : null}</AnimatePresence>
    </Card>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-stroke/85 bg-surface px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-gold-rich">{icon}</span>
        {label}
      </span>
      <span className="text-right text-sm font-medium text-text">{value}</span>
    </div>
  );
}
