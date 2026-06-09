import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-stroke/90 bg-surface/95 shadow-soft backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
