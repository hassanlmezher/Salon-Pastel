"use client";

import { CalendarDays } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function formatDay(value: string, today: string) {
  if (value === today) return "Today";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** A tab that opens the phone's native date picker and shows one day. */
export function DayPicker({ value, today }: { value: string; today: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className={`adminDayPicker${value ? " active" : ""}`}>
      <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
      <span>{value ? formatDay(value, today) : "Pick day"}</span>
      <input
        type="date"
        aria-label="Pick a day"
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("view");
          if (event.target.value) params.set("date", event.target.value);
          else params.delete("date");
          const query = params.toString();
          router.push(query ? `${pathname}?${query}` : pathname);
        }}
      />
    </label>
  );
}
