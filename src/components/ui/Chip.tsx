import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-stroke/80 bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}
