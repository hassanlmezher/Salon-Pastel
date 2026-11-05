import { useState } from "react";
import { buildCalendarFileUrl, buildGoogleCalendarUrl, type CalendarEventInput } from "../logic/calendarFile";

function isApplePhone() {
  if (typeof navigator === "undefined") return false;
  // iPadOS reports itself as a Mac, so a Mac with touch counts too.
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

const buttonClass = "flex min-h-12 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition";
const primaryClass = `${buttonClass} bg-white text-[#9e5a51] active:bg-white/85`;
const secondaryClass = `${buttonClass} border border-white bg-[#fff3ef] text-[#7a463f] active:bg-[#fbe3dd]`;

/** Ways to keep the booking in mind: the phone's own calendar, Google Calendar, or a message to themselves. */
export function ReminderOptions({ event, summary }: { event: CalendarEventInput; summary: string }) {
  const [apple] = useState(isApplePhone);
  const [shareState, setShareState] = useState<"" | "copied" | "failed">("");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const appleLink = (
    <a key="apple" href={buildCalendarFileUrl(event)} className={apple ? primaryClass : secondaryClass}>
      {apple ? "Add to iPhone Calendar" : "Other calendar app (.ics)"}
    </a>
  );
  const googleLink = (
    <a
      key="google"
      href={buildGoogleCalendarUrl(event)}
      target="_blank"
      rel="noopener"
      className={apple ? secondaryClass : primaryClass}
    >
      Add to Google Calendar
    </a>
  );

  async function shareDetails() {
    setShareState("");
    try {
      if (canShare) {
        await navigator.share({ title: "My Pastel appointment", text: summary });
        return;
      }
      await navigator.clipboard.writeText(summary);
      setShareState("copied");
    } catch (error) {
      // Closing the share sheet is not an error.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareState("failed");
    }
  }

  return (
    <section className="mt-5 text-left" aria-labelledby="reminder-heading">
      <h3 id="reminder-heading" className="text-center text-sm font-semibold text-white">
        Get a reminder · <span lang="ar" dir="rtl" className="font-normal">ذكّريني بالموعد</span>
      </h3>
      <div className="mt-2 grid gap-2">
        {apple ? [appleLink, googleLink] : [googleLink, appleLink]}
        <button type="button" onClick={shareDetails} className={secondaryClass}>
          {canShare ? "Send details to myself" : shareState === "copied" ? "Copied ✓" : "Copy details"}
        </button>
      </div>
      <p className="mt-2 text-center text-xs leading-5 text-white/90" aria-live="polite">
        {shareState === "copied"
          ? "Details copied. Paste them in WhatsApp or Notes."
          : shareState === "failed"
            ? "Could not share. Take a screenshot of this screen instead."
            : apple
              ? "Your iPhone will remind you 1 day and 2 hours before."
              : "Save it so your phone reminds you before your visit."}
      </p>
    </section>
  );
}
