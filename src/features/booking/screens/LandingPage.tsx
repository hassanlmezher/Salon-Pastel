import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import pricesImage from "../../../images/prices.png";

const heroVideo = "/hero-banner.mp4";

const seasonalSpecials = [
  { name: "MANICURE", price: "$15.00" },
  { name: "PEDICURE", price: "$25.00" },
  { name: "FACIAL", price: "$50.00" },
  { name: "LASER SERVICE", price: "$35.00" },
  { name: "WAXING full body", price: "$60.00" },
  { name: "MASSAGE body therapy", price: "$40.00" },
] as const;

const wordmarkStyle = {
  backgroundImage: "linear-gradient(135deg, #6d3f1f 0%, #b78643 42%, #f2d39a 58%, #8a4f24 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  textShadow: "0 1px 0 rgba(255, 242, 220, 0.34), 0 10px 24px rgba(97, 58, 24, 0.16)",
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
  const quoteOpacity = useTransform(smoothProgress, [0.1, 0.32, 0.9], [0, 1, 1]);
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCtaPinned(!entry.isIntersecting);
      },
      {
        threshold: 0.01,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
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
            <p className="-mt-1 pl-1 text-[10px] uppercase tracking-[0.26em] text-[#b89a7c] sm:text-[11px]">
              Nail and beauty lounge
            </p>
          </button>
        </div>
      </header>

      <section
        ref={heroRef}
        id="hero"
        className="relative h-[46vh] min-h-[24rem] w-full overflow-hidden bg-[#e7d8ce] sm:h-[54vh] lg:h-[62vh]"
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
          className="absolute inset-0 will-change-transform bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_36%,rgba(42,24,19,0.18)_100%)]"
          style={reduceMotion ? undefined : { y: overlayY }}
        />

        <motion.div
          className="absolute inset-0 will-change-transform bg-[radial-gradient(circle_at_18%_100%,rgba(183,134,67,0.24),transparent_20%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.22),transparent_18%)]"
          style={reduceMotion ? undefined : { y: overlayY }}
        />

        <div className="relative flex h-full items-center px-4 sm:px-6">
          <motion.div
            className="max-w-[32rem] bg-transparent px-0 py-0 text-[#f6c9b8]/70 shadow-none backdrop-blur-0 mix-blend-screen sm:max-w-[38rem] lg:max-w-[42rem]"
            style={reduceMotion ? undefined : { y: bubbleY, opacity: quoteOpacity }}
          >
            <p
              className="text-left font-body text-[1.9rem] font-black leading-[0.96] tracking-[-0.08em] text-[#f6c9b8]/70 sm:text-[2.7rem] lg:text-[3.6rem]"
              style={{
                WebkitTextStroke: "1px rgba(255, 244, 238, 0.12)",
              }}
            >
              Welcome to Pastel Nail Salon.
            </p>
          </motion.div>
        </div>

        <div
          ref={ctaRef}
          className="absolute left-1/2 top-8 z-20 flex -translate-x-1/2 justify-center px-4"
        >
          <Button
            type="button"
            onClick={goToBooking}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            className="min-h-11 rounded-none border border-[#f2d39a] bg-[linear-gradient(135deg,#b78643_0%,#e0b85f_48%,#f7e1a4_100%)] px-5 text-[#3c2412] shadow-[0_16px_34px_rgba(183,134,67,0.34)]"
          >
            Book Appointment
          </Button>
        </div>
      </section>

      <div
        className={`pointer-events-none fixed left-1/2 top-4 z-40 flex -translate-x-1/2 justify-center px-4 transition-all duration-300 sm:top-6 lg:top-8 ${
          isCtaPinned ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
        aria-hidden={!isCtaPinned}
      >
        <Button
          type="button"
          onClick={goToBooking}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          className="pointer-events-auto min-h-11 rounded-none border border-[#f2d39a] bg-[linear-gradient(135deg,#b78643_0%,#e0b85f_48%,#f7e1a4_100%)] px-5 text-[#3c2412] shadow-[0_16px_34px_rgba(183,134,67,0.34)]"
        >
          Book Appointment
        </Button>
      </div>

      <section
        id="services"
        className="relative isolate w-full overflow-hidden bg-[#e7d8ce] py-16 sm:py-20 lg:min-h-[90vh] lg:py-0"
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

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_38%,rgba(42,24,19,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_100%,rgba(183,134,67,0.14),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.18),transparent_18%)]" />

        <div className="relative mx-auto flex min-h-[34rem] items-center justify-center px-4 sm:px-6 lg:min-h-[90vh] lg:px-12">
          <div
            className="w-full max-w-[620px] border border-white/12 bg-[rgba(41,30,24,0.78)] px-6 py-8 text-white shadow-[0_24px_80px_rgba(33,20,25,0.22)] backdrop-blur-[4px] sm:px-10 sm:py-10 lg:px-14 lg:py-14"
          >
            <div className="flex flex-col items-center text-center">
              <span className="mb-5 block h-[2px] w-14 bg-[#f5dccd]/70 sm:mb-6" />
              <h2 className="font-display text-[2.8rem] italic leading-none tracking-[-0.03em] text-[#fff8f3] sm:text-[4rem] lg:text-[4.8rem]">
                Seasonal Specials
              </h2>
            </div>

            <div className="mt-8 space-y-0 sm:mt-10">
              {seasonalSpecials.map((item) => (
                <div
                  key={item.name}
                  className="flex items-baseline justify-between gap-4 border-b border-white/10 py-4 last:border-b-0 sm:py-5"
                >
                  <p className="text-[0.9rem] font-medium uppercase tracking-[0.18em] text-[#fff8f3]/90 sm:text-[1rem] sm:tracking-[0.22em]">
                    {item.name}
                  </p>
                  <p className="whitespace-nowrap text-[0.9rem] text-[#f7e4d7]/82 sm:text-[1rem]">
                    Starting from {item.price}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:mt-10">
              <button
                type="button"
                onClick={goToBooking}
                className="text-[0.78rem] font-medium uppercase tracking-[0.26em] text-[#f7e4d7]/78 transition hover:text-[#fff8f3]"
              >
                Discover Offers
              </button>
            </div>
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
            <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-[#b89a7c] sm:text-xs sm:tracking-[0.32em]">
              Nail and beauty lounge
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6d5648] sm:mt-4 sm:leading-7">
              Luxury pastel salon care with simple booking and calm appointments.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:contents">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b6b58] sm:text-[11px] sm:tracking-[0.28em]">
                Contact
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6d5648] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-6">
                <li>hello@pastelnailsalon.com</li>
                <li>+1 (000) 000-0000</li>
                <li>Mon-Sat, 9-7</li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b6b58] sm:text-[11px] sm:tracking-[0.28em]">
                Links
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#6d5648] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-6">
                <li>
                  <button type="button" onClick={goToBooking} className="transition hover:text-[#b78643]">
                    Book
                  </button>
                </li>
                <li>Specials</li>
                <li>About</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-6 flex max-w-[88rem] items-center justify-between border-t border-[#dccab8]/70 pt-3 text-[10px] uppercase tracking-[0.18em] text-[#a78b74] sm:mt-10 sm:pt-4 sm:text-xs sm:tracking-[0.24em]">
          <span>Pastel Salon</span>
          <span>© 2026</span>
        </div>
      </footer>
    </>
  );
}
