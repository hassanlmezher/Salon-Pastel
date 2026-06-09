import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import heroVideo from "../../../images/Luxury_Nail_Salon_Hero_Banner_Silent.mp4";

export function LandingPage() {
  return (
    <section id="hero" className="px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[34px] bg-[#1e1611] shadow-[0_32px_90px_rgba(48,30,19,0.24)] sm:rounded-[40px]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            defaultMuted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,21,18,0.18)_0%,rgba(33,21,18,0.34)_38%,rgba(33,21,18,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,222,239,0.36),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_20%_100%,rgba(198,115,161,0.32),transparent_28%)]" />

          <div className="relative flex min-h-[72vh] flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 lg:min-h-[78vh] lg:px-14 lg:py-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#ffd3ea]" />
                  London appointments
                </div>
                <Link to="/book/service">
                  <Button
                    type="button"
                    className="min-h-11 border border-white/10 bg-[#7f2478] px-5 text-white shadow-[0_16px_30px_rgba(61,18,57,0.35)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      Click To Book
                      <ArrowRight size={16} />
                    </span>
                  </Button>
                </Link>
              </div>

              <div className="max-w-3xl pt-4 sm:pt-8 lg:max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/74">
                  Muted video hero
                </p>
                <h1 className="mt-4 font-display text-[54px] leading-[0.9] text-white sm:text-[82px] lg:text-[112px]">
                  Quiet luxury for nails, beauty, and polished appointments.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                  A softer first impression with motion, clarity, and immediate access to online
                  booking.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-end">
              <div className="hero-note max-w-2xl rounded-[30px] bg-white/92 p-6 text-text shadow-[0_20px_60px_rgba(48,30,19,0.2)] backdrop-blur-xl sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d4f8c]">
                  Welcome
                </p>
                <p className="mt-3 text-[26px] leading-[1.45] sm:text-[32px]">
                  Book your next manicure, pedicure, or beauty treatment in a calmer digital
                  space designed around the hero video.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:items-end">
                <div className="flex flex-wrap gap-3">
                  {["Nail Services", "Beauty Lounge", "Muted Background Video"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/24 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="font-display text-[56px] leading-none text-white/72 sm:text-[96px] lg:text-[148px]">
                  Nails &amp; Beauty
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
