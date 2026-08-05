import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

const heroVideo = "/hero-banner.mp4";
const pricesImage = new URL("../../../images/prices.png", import.meta.url).href;

const serviceOfferings = [
  {
    name: "Nail Care & Manicure",
    description: "Clean shaping, cuticle care, polish, and refined everyday nail grooming.",
    descriptionAr: "تنظيف وتشكيل الأظافر، عناية بالجلد المحيط، طلاء، ولمسة نهائية مرتبة لكل يوم.",
  },
  {
    name: "Pedicure Services",
    description: "Relaxed foot care with soaking, exfoliation, shaping, and a polished finish.",
    descriptionAr: "عناية مريحة بالقدمين مع نقع، تقشير، تشكيل، ولمسة طلاء أنيقة.",
  },
  {
    name: "Hand Treatments & Spa",
    description: "Softening hand rituals with hydration, massage, and spa-focused care.",
    descriptionAr: "علاجات لتنعيم اليدين مع ترطيب، تدليك، وعناية سبا هادئة.",
  },
  {
    name: "Nail Treatments",
    description: "Strengthening and recovery treatments for healthier natural nails.",
    descriptionAr: "علاجات تقوية وتعافي للحصول على أظافر طبيعية أكثر صحة.",
  },
] as const;

const bookButtonClass =
  "inline-flex min-h-16 flex-col items-center justify-center gap-1 border border-[#e4a994] bg-[#f6c9b8] px-6 py-3 text-center text-[#3d2113] shadow-[0_18px_38px_rgba(123,67,46,0.28)] hover:bg-[#f3b8c8] focus-visible:ring-[#8a4545] sm:px-8";

const wordmarkStyle = {
  backgroundImage: "linear-gradient(135deg, #6d3f1f 0%, #b78643 42%, #f2d39a 58%, #8a4f24 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  textShadow: "0 1px 0 rgba(255, 242, 220, 0.34), 0 10px 24px rgba(97, 58, 24, 0.16)",
};

const sectionTitleStyle = {
  backgroundImage: "linear-gradient(135deg, #4d2a16 0%, #8a4f24 45%, #b78643 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  textShadow: "0 1px 0 rgba(255, 246, 229, 0.6), 0 10px 24px rgba(61, 36, 18, 0.18)",
};

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [isCtaPinned, setIsCtaPinned] = useState(false);
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
  useEffect(() => {
    let frame = 0;

    const updatePinnedState = () => {
      const node = ctaRef.current;
      if (!node) return;

      setIsCtaPinned(node.getBoundingClientRect().top <= 0);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePinnedState);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

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
            <p className="mt-0.5 pl-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#745d4d] sm:text-xs sm:tracking-[0.26em]">
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
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
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
            className="max-w-[32rem] border border-white/20 bg-[rgba(47,33,27,0.86)] px-4 py-4 text-[#fffaf6] shadow-[0_18px_48px_rgba(28,18,14,0.28)] backdrop-blur-md sm:max-w-[38rem] sm:px-6 sm:py-5 lg:max-w-[42rem]"
            style={reduceMotion ? undefined : { y: bubbleY }}
          >
            <p
              className="text-left font-body text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#fffaf6] sm:text-[2.7rem] sm:tracking-[-0.03em] lg:text-[3.6rem]"
              style={{
                textShadow: "0 2px 16px rgba(0, 0, 0, 0.28)",
              }}
            >
              Welcome to Pastel Nail Salon.
            </p>
          </motion.div>
          <motion.div
            className="ml-auto max-w-[30rem] border border-white/20 bg-[rgba(47,33,27,0.86)] px-4 py-4 text-right text-[#fffaf6] shadow-[0_18px_48px_rgba(28,18,14,0.28)] backdrop-blur-md sm:px-6 sm:py-5 lg:max-w-[36rem]"
            style={reduceMotion ? undefined : { y: bubbleY }}
          >
            <p
              className="font-body text-[1.65rem] font-extrabold leading-[1.22] tracking-normal text-[#fffaf6] sm:text-[2.3rem] lg:text-[3.25rem]"
              lang="ar"
              dir="rtl"
              style={{
                textShadow: "0 2px 16px rgba(0, 0, 0, 0.28)",
              }}
            >
              أهلاً بك في صالون باستيل للأظافر.
            </p>
          </motion.div>
        </div>

        <div
          ref={ctaRef}
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

      <div
        className={`pointer-events-none fixed left-1/2 top-0 z-40 flex -translate-x-1/2 justify-center px-4 transition-all duration-300 ${
          isCtaPinned ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        aria-hidden={!isCtaPinned}
      >
        <Button
          type="button"
          onClick={goToBooking}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          className={`pointer-events-auto ${bookButtonClass}`}
        >
          <span>Book an Appointment</span>
          <span className="text-[0.82rem] normal-case tracking-normal" lang="ar" dir="rtl">
            احجز موعدك
          </span>
        </Button>
      </div>

      <section
        id="services"
        className="relative isolate w-full overflow-hidden bg-[#f7efe6] py-16 sm:py-20 lg:py-24"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${pricesImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,239,230,0.9)_0%,rgba(247,239,230,0.82)_46%,rgba(246,201,184,0.54)_100%)] backdrop-blur-[9px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_100%,rgba(246,201,184,0.24),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.35),transparent_18%)]" />

        <div className="relative mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="mb-5 block h-[2px] w-14 bg-[#d68599]/70 sm:mb-6" />
            <h2 className="font-display text-[2.8rem] font-semibold italic leading-none sm:text-[4rem] lg:text-[4.8rem]" style={sectionTitleStyle}>
              What We Offer
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6d5648] sm:text-base">
              Detailed nail and spa services designed for clean finishes, soft skin, and calm salon appointments.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {serviceOfferings.map((item) => (
              <article
                key={item.name}
                className="border border-[#e7c9c2]/80 bg-[#fff9f4]/92 p-5 text-[#3c2412] shadow-[0_18px_42px_rgba(97,58,24,0.1)] backdrop-blur-[10px] sm:p-6"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center border border-[#f6c9b8] bg-[#f6c9b8]/42 text-sm font-semibold text-[#8a4545]">
                  {item.name.charAt(0)}
                </div>
                <h3 className="text-base font-semibold uppercase tracking-[0.14em] text-[#6d3f1f]">
                  {item.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6d5648]">
                  {item.description}
                  <span className="mt-3 block text-right leading-7" lang="ar" dir="rtl">
                    {item.descriptionAr}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative isolate overflow-hidden border-t border-[#dccab8]/70 bg-[#f7efe6] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(183,134,67,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(242,211,154,0.18),transparent_22%)]" />
        <div className="relative mx-auto grid max-w-[88rem] gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] lg:items-start">
          <div className="border-b border-[#dccab8]/70 pb-5 sm:border-b-0 sm:pb-0">
            <p className="font-display text-[38px] font-semibold leading-none sm:text-[56px]" style={wordmarkStyle}>
              Pastel
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#745d4d] sm:text-xs sm:tracking-[0.26em]">
              Nail and beauty lounge
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6d5648] sm:mt-4 sm:leading-7">
              Simple booking, polished nail care, and calm salon appointments.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:contents">
            <div>
              <p className="text-[10px] font-semibold tracking-normal text-[#8b6b58] sm:text-[11px]" lang="ar" dir="rtl">
                المالكة
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6d5648] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-6">
                <li>Haifa Salman Mezher</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-normal text-[#8b6b58] sm:text-[11px]" lang="ar" dir="rtl">
                الهاتف
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6d5648] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-6">
                <li>+961 71 430 542</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-normal text-[#8b6b58] sm:text-[11px]" lang="ar" dir="rtl">
                ساعات العمل
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6d5648] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-6">
                <li>8:30 am till 6 pm</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-6 flex max-w-[88rem] items-center justify-between border-t border-[#dccab8]/70 pt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6d5648] sm:mt-10 sm:pt-4 sm:text-xs sm:tracking-[0.2em]">
          <span>Pastel Salon</span>
          <span>© 2026</span>
        </div>
      </footer>
    </>
  );
}
