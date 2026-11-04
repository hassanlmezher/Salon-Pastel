import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

const heroVideo = "/hero-banner.mp4";
const heroPoster = "/hero-poster.webp";

const bookButtonClass =
  "inline-flex min-h-16 flex-col items-center justify-center gap-1 border border-[#e4a994] bg-[#f6c9b8] px-6 py-3 text-center text-[#3d2113] shadow-[0_18px_38px_rgba(123,67,46,0.28)] hover:bg-[#f3b8c8] focus-visible:ring-[#8a4545] sm:px-8";

const wordmarkStyle = {
  backgroundImage: "linear-gradient(135deg, #6d3f1f 0%, #b78643 42%, #f2d39a 58%, #8a4f24 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  textShadow: "0 1px 0 rgba(255, 242, 220, 0.34), 0 10px 24px rgba(97, 58, 24, 0.16)",
};

const heroTextStyle = {
  WebkitTextStroke: "1px rgba(40, 24, 18, 0.72)",
  paintOrder: "stroke fill",
  textShadow:
    "0 2px 2px rgba(22, 13, 10, 0.9), 0 5px 14px rgba(22, 13, 10, 0.78), 0 12px 32px rgba(22, 13, 10, 0.62)",
};

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 92,
    damping: 24,
    mass: 0.28,
  });

  const videoY = useTransform(smoothProgress, [0, 1], [-150, 140]);
  const videoScale = useTransform(smoothProgress, [0, 1], [1.16, 1.04]);
  const overlayY = useTransform(smoothProgress, [0, 1], [-24, 44]);
  const bubbleY = useTransform(smoothProgress, [0, 1], [18, -12]);

  const goToBooking = () => {
    navigate("/book");
  };

  return (
    <>
      <header className="relative z-30 border-b border-black/5 bg-[#f7efe6]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[88rem] items-center px-4 py-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate("/")} className="shrink-0 text-left">
            <p className="font-display text-[42px] font-semibold leading-none sm:text-[56px]" style={wordmarkStyle}>
              Pastel
            </p>
            <p className="mt-0.5 pl-1 text-xs font-medium uppercase tracking-[0.22em] text-[#745d4d] sm:text-xs sm:tracking-[0.26em]">
              Nail and beauty lounge
            </p>
          </button>
        </div>
      </header>

      <section
        ref={heroRef}
        id="hero"
        className="relative h-[calc(100svh-5.5rem)] min-h-[32rem] w-full overflow-hidden bg-[#e7d8ce]"
      >
        <motion.video
          className="absolute left-0 top-[-8%] h-[116%] w-full object-cover will-change-transform"
          autoPlay={!reduceMotion}
          loop
          muted
          playsInline
          poster={heroPoster}
          preload={reduceMotion ? "none" : "auto"}
          aria-hidden="true"
          style={reduceMotion ? undefined : { y: videoY, scale: videoScale }}
        >
          <source src={heroVideo} type="video/mp4" />
        </motion.video>

        <motion.div
          className="absolute inset-0 will-change-transform bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(42,24,19,0.12)_42%,rgba(42,24,19,0.38)_100%)]"
          style={reduceMotion ? undefined : { y: overlayY }}
        />

        <motion.div
          className="absolute inset-0 will-change-transform bg-[radial-gradient(circle_at_18%_100%,rgba(183,134,67,0.24),transparent_20%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.22),transparent_18%)]"
          style={reduceMotion ? undefined : { y: overlayY }}
        />

        <div className="relative flex h-full flex-col justify-center gap-14 px-4 sm:gap-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <motion.div
            className="max-w-[32rem] px-4 py-4 text-[#fffaf6] sm:max-w-[38rem] sm:px-6 sm:py-5 lg:max-w-[42rem]"
            style={reduceMotion ? undefined : { y: bubbleY }}
          >
            <h1
              className="text-left font-body text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#fffaf6] sm:text-[2.7rem] sm:tracking-[-0.03em] lg:text-[3.6rem]"
              style={heroTextStyle}
            >
              Welcome to Pastel Nail Salon.
            </h1>
          </motion.div>
          <motion.div
            className="ml-auto max-w-[30rem] px-4 py-4 text-right text-[#fffaf6] sm:px-6 sm:py-5 lg:max-w-[36rem]"
            style={reduceMotion ? undefined : { y: bubbleY }}
          >
            <p
              className="font-body text-[1.65rem] font-extrabold leading-[1.22] tracking-normal text-[#fffaf6] sm:text-[2.3rem] lg:text-[3.25rem]"
              lang="ar"
              dir="rtl"
              style={heroTextStyle}
            >
              أهلاً بك في صالون باستيل للأظافر.
            </p>
          </motion.div>
        </div>

        <div
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 justify-center px-4 sm:bottom-8"
        >
          <Button
            type="button"
            onClick={goToBooking}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            className={bookButtonClass}
          >
            <span>Book an Appointment</span>
            <span className="text-[0.82rem] normal-case tracking-normal" lang="ar" dir="rtl">
              احجز موعدك
            </span>
          </Button>
        </div>
      </section>

      <footer className="border-t border-[#dccab8]/70 bg-[#f7efe6] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[88rem] gap-4 text-sm text-[#6d5648] sm:grid-cols-3 sm:gap-8">
          <a
            href="tel:+96171430542"
            className="flex min-h-12 items-center justify-between gap-3 border border-[#e7c9c2] bg-[#fffaf6] px-4 font-semibold text-[#8a4545]"
          >
            <span>Call +961 71 430 542</span>
            <span lang="ar" dir="rtl">اتصل بنا</span>
          </a>
          <p className="flex min-h-12 items-center justify-between gap-3 px-1">
            <span>Tue–Sun 8 am – 6 pm · Closed Mon</span>
            <span lang="ar" dir="rtl">ساعات العمل</span>
          </p>
          <p className="flex min-h-12 items-center justify-between gap-3 px-1">
            <span>Haifa Salman Mezher</span>
            <span lang="ar" dir="rtl">المالكة</span>
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-[88rem] text-xs uppercase tracking-[0.16em] text-[#836553]">© 2026 Pastel Salon</p>
      </footer>
    </>
  );
}
