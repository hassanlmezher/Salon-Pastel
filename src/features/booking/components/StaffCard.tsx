import { Star } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../lib/cn";
import type { Staff } from "../types";

export function StaffCard({
  staff,
  selected,
  onSelect,
}: {
  staff: Staff;
  selected: boolean;
  onSelect: (staffId: string) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        className="sr-only"
        name="staff"
        checked={selected}
        onChange={() => onSelect(staff.id)}
      />
      <Card
        className={cn(
          "p-4 transition",
          selected ? "border-gold-deep bg-gold-soft/10 shadow-soft" : "bg-surface hover:border-gold-soft/70",
        )}
      >
        <div className="flex items-start gap-4">
          <img
            src={staff.avatar}
            alt=""
            className="h-16 w-16 rounded-[20px] object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text">{staff.name}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                <Star size={14} className="fill-current text-gold-deep" aria-hidden="true" />
                {staff.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gold-rich">{staff.role}</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">{staff.bio}</p>
          </div>
        </div>
      </Card>
    </label>
  );
}
