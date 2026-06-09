import { ArrowLeft, Globe2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { BookingSummaryCard } from "./BookingSummaryCard";
import { MobileStickyCTA } from "./MobileStickyCTA";
import { ProgressStepper } from "./ProgressStepper";
import { useBooking } from "../context/BookingContext";
import type { BookingStep } from "../types";

export function BookingLayout({
  step,
  title,
  description,
  timezone,
  timezoneNote,
  children,
  ctaLabel,
  ctaDisabled,
  onCta,
  backTo,
  mobileTitle,
  mobileSubtitle,
}: {
  step: BookingStep;
  title: string;
  description: string;
  timezone: string;
  timezoneNote?: string;
  children: React.ReactNode;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  backTo?: string;
  mobileTitle: string;
  mobileSubtitle: string;
}) {
  const navigate = useNavigate();
  const { draft, quote } = useBooking();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
      <section className="min-w-0">
        <ProgressStepper current={step} />
        <div className="mt-10 flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-rich">
              {step === "service" ? "Step 1 of 3" : step === "schedule" ? "Step 2 of 3" : "Step 3 of 3"}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[46px] leading-[0.92] text-text sm:text-[62px]">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">{description}</p>
          </div>
          {backTo ? (
            <Link to={backTo} className="hidden lg:block">
              <Button type="button" variant="secondary">
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back
                </span>
              </Button>
            </Link>
          ) : null}
        </div>

        {timezoneNote ? (
          <div className="mt-6 inline-flex items-start gap-2 rounded-full border border-stroke/80 bg-surface px-4 py-2 text-sm text-text-secondary">
            <Globe2 size={16} className="mt-0.5 text-gold-rich" aria-hidden="true" />
            {timezoneNote}
          </div>
        ) : null}

        <div className="mt-10">{children}</div>

        <div className="mt-8 hidden lg:block">
          <Button type="button" onClick={onCta} disabled={ctaDisabled} className="px-7">
            {ctaLabel}
          </Button>
        </div>
      </section>

      <aside className="hidden lg:sticky lg:top-10 lg:block">
        <BookingSummaryCard draft={draft} quote={quote} timezone={timezone} />
      </aside>

      <MobileStickyCTA
        title={mobileTitle}
        subtitle={mobileSubtitle}
        cta={ctaLabel}
        disabled={ctaDisabled}
        onClick={onCta}
        backLabel={backTo ? "Back" : undefined}
        onBack={backTo ? () => navigate(backTo) : undefined}
      />
    </div>
  );
}
