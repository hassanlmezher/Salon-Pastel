import { UsersRound } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { Staff } from "../types";
import { StaffCard } from "./StaffCard";

export function StaffPreference({
  staff,
  selectedStaffId,
  onSelect,
}: {
  staff: Staff[];
  selectedStaffId: string | null;
  onSelect: (staffId: string | null) => void;
}) {
  return (
    <Card className="paper-panel p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-gold-rich text-white">
          <UsersRound size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-[32px] leading-none text-text">Choose your specialist</h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Any available is fastest. Choose someone specific if you already know who you want.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-stroke bg-surface px-4 py-4">
          <input
            type="radio"
            name="staff-preference"
            checked={selectedStaffId === null}
            onChange={() => onSelect(null)}
            className="h-4 w-4 border-stroke text-gold-deep focus:ring-gold-rich"
          />
          <div>
            <p className="text-sm font-semibold text-text">Any available</p>
            <p className="text-sm text-text-secondary">We will show the best appointment times across the team.</p>
          </div>
        </label>
      </div>
      <div className="mt-4 grid gap-3">
        {staff.map((member) => (
          <StaffCard
            key={member.id}
            staff={member}
            selected={selectedStaffId === member.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </Card>
  );
}
