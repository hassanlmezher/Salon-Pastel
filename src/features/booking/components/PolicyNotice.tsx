import { ShieldCheck } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export function PolicyNotice() {
  return (
    <Card className="bg-surface-muted p-5">
      <div className="flex gap-3">
        <div className="mt-1 grid h-10 w-10 place-items-center rounded-2xl bg-surface text-gold-deep">
          <ShieldCheck size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Free changes up to 24 hours before your appointment.</p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            If your booking is already inside the change window, contact the salon and we will help manually.
          </p>
        </div>
      </div>
    </Card>
  );
}
