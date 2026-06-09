import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import heroVideo from "../../../images/Luxury_Nail_Salon_Hero_Banner_Silent.mp4";
import manicureImage from "../../../images/image1.png";
import pedicureImage from "../../../images/image2.png";
import skinCareImage from "../../../images/image3.png";

const services = [
  {
    title: "Manicure",
    subtitle: "Cuticle work, shaping, and clean finishes",
    image: manicureImage,
    imageAlt: "Manicure service close-up",
    tone: "peach",
  },
  {
    title: "Pedicure",
    subtitle: "Soft care, polish refresh, and detailed treatment",
    image: pedicureImage,
    imageAlt: "Pedicure treatment in progress",
    tone: "cream",
  },
  {
    title: "Skin Care",
    subtitle: "Facials and skin rituals with a softer touch",
    image: skinCareImage,
    imageAlt: "Skin care facial treatment",
    tone: "peach",
  },
] as const;

export function LandingPage() {
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
  const bubbleY = useTransform(smoothProgress, [0, 1], [70, -54]);
  const quoteOpacity = useTransform(smoothProgress, [0.1, 0.32, 0.9], [0, 1, 1]);

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        className="relative h-[76vh] min-h-[34rem] w-full overflow-hidden bg-[#e7d8ce] sm:h-[82vh] lg:h-[88vh]"
      >
        <motion.video
          className="absolute left-0 top-[-16%] h-[142%] w-full object-cover will-change-transform"
          autoPlay
          loop
          muted
          defaultMuted
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
          className="absolute inset-0 will-change-transform bg-[radial-gradient(circle_at_18%_100%,rgba(201,95,156,0.26),transparent_20%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.22),transparent_18%)]"
          style={reduceMotion ? undefined : { y: overlayY }}
        />

        <div className="relative flex h-full items-center justify-center px-4 sm:px-6">
          <motion.div
            className="hero-note max-w-[48rem] rounded-[2.25rem] bg-white/96 px-6 py-5 text-[#2d221d] shadow-[0_20px_60px_rgba(48,30,19,0.14)] backdrop-blur-md sm:px-8 sm:py-7"
            style={reduceMotion ? undefined : { y: bubbleY, opacity: quoteOpacity }}
          >
            <p className="text-[1.25rem] leading-[1.55] sm:text-[1.8rem]">
              Welcome to Pastel Nail Salon.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="services" className="w-full bg-white">
        <div className="flex flex-col">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`grid min-h-[24rem] w-full overflow-hidden md:min-h-[30rem] lg:min-h-[34rem] lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
              }`}
            >
              <div
                className={`flex flex-col items-center justify-center px-8 py-12 text-center sm:px-12 lg:px-16 ${
                  service.tone === "peach" ? "bg-[#f9ccba]" : "bg-[#fbf8f4]"
                }`}
              >
                <span className="mb-8 block h-[6px] w-16 bg-black" />
                <h2 className="font-display text-[3rem] leading-none text-black sm:text-[4rem] lg:text-[5rem]">
                  {service.title}
                </h2>
                <p className="mt-8 max-w-[24rem] text-lg leading-8 text-black/75 sm:text-[1.65rem] sm:leading-10 lg:text-[2rem] lg:leading-[1.45]">
                  {service.subtitle}
                </p>
              </div>

              <div className="min-h-[24rem] bg-[#f3ece6] md:min-h-[30rem] lg:min-h-[34rem]">
                <img src={service.image} alt={service.imageAlt} className="h-full w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
