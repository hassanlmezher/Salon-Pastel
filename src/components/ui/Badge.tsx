import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold-soft/35 bg-gold-soft/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-rich",
        className,
      )}
      {...props}
    />
  );
}
