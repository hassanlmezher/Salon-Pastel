import { PlusCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Chip } from "../../../components/ui/Chip";
import { currency } from "../../../lib/format";
import { cn } from "../../../lib/cn";
import type { AddOn } from "../types";

export function AddOnSheet({
  addOns,
  selectedIds,
  onToggle,
}: {
  addOns: AddOn[];
  selectedIds: string[];
  onToggle: (addOnId: string) => void;
}) {
  if (addOns.length === 0) return null;

  return (
    <Card className="paper-panel p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gold-rich text-white">
          <PlusCircle size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-[32px] leading-none text-text">Anything to add?</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Add-ons adjust timing, pricing, and availability immediately.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {addOns.map((addOn) => {
          const checked = selectedIds.includes(addOn.id);
          return (
            <label
              key={addOn.id}
            className={cn(
              "flex cursor-pointer items-start justify-between gap-4 rounded-[22px] border p-4 transition",
              checked
                ? "border-gold-deep bg-gold-soft/10 shadow-soft"
                : "border-stroke bg-surface hover:border-gold-soft/70",
            )}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(addOn.id)}
                  className="mt-1 h-4 w-4 rounded border-stroke text-gold-deep focus:ring-gold-rich"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-medium text-text">{addOn.name}</span>
                    <Chip>+{currency(addOn.price)}</Chip>
                    <Chip>{addOn.durationMin} min</Chip>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">{addOn.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </Card>
  );
}
