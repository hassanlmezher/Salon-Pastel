import type { Service, TimePeriod } from "../types";

type IconProps = {
  className?: string;
};

const base = "h-5 w-5";

export function ServiceIcon({
  icon,
  className = base,
}: IconProps & Pick<Service, "icon">) {
  switch (icon) {
    case "manicure":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 3c1.6 3 3.7 4.8 6.5 5.6-1 4.9-3.1 8.7-6.5 12-3.4-3.3-5.6-7.1-6.5-12C8.3 7.8 10.4 6 12 3Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v12M7.8 10.5h8.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "pedicure":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M6 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm5-1a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Zm4 1.2a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 10.5c1.6-.8 3.4-.8 5 0 1.8.8 3 2.7 3 4.7a4.5 4.5 0 0 1-9 0c0-2 1.2-3.9 3-4.7Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "gel":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 3c3.7 3.9 5.5 6.9 5.5 9.2A5.5 5.5 0 1 1 6.5 12.2C6.5 9.9 8.3 6.9 12 3Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.5 14.5c.9.8 1.7 1.2 2.5 1.2 1 0 1.9-.5 2.8-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "detail":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 4a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 4Zm-6 7.4a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Zm12 0a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7.5 18.5c1.5-2.7 4-4.2 7.5-4.5 1.2 1.4 1.8 2.9 1.8 4.5a1 1 0 0 1-1 1H8.5a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "facial":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 4c3 0 5.6 2.5 5.6 5.7 0 3-1 5.7-2.8 8.1-.8 1-1.8 1.5-2.8 1.5s-2-.5-2.8-1.5C7.4 15.4 6.4 12.7 6.4 9.7 6.4 6.5 9 4 12 4Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10.2h4M10.5 13.5c.8.7 1.9 1 3 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
}

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.75" y="5.75" width="16.5" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.75v4.5M16 3.75v4.5M3.75 9.5h16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.75v4.5l3.2 1.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3.5 13.7 8l4.8 1.6-4.8 1.6L12 15.7l-1.7-4.5-4.8-1.6L10.3 8 12 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m18.7 15.1.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function PriceIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4.5v15m3-11.5c-.7-.9-1.9-1.5-3.4-1.5-2 0-3.6 1-3.6 2.7s1.5 2.4 3.8 2.8c2.4.5 4 1.1 4 3 0 1.8-1.8 3-4.1 3-1.8 0-3.3-.6-4.2-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PeriodIcon({
  period,
  className = base,
}: IconProps & { period: TimePeriod }) {
  if (period === "Morning") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (period === "Afternoon") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M4 14.5A8 8 0 1 0 20 14.5H4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 5V3.5M7 7l-1-1M17 7l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15.5 4.5A7.5 7.5 0 1 0 19.5 18c-4 .3-7.5-2.8-7.5-6.8 0-2.8 1.6-5.2 3.5-6.7Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m5.5 12.5 4.2 4.2L18.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
