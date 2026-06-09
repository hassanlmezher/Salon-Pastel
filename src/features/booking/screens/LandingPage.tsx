import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import heroVideo from "../../../images/Luxury_Nail_Salon_Hero_Banner_Silent.mp4";

export function LandingPage() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const bubbleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-[72vh] min-h-[34rem] w-full overflow-hidden bg-[#e7d8ce] sm:h-[78vh] lg:h-[82vh]"
    >
      <motion.video
        className="absolute left-0 top-[-8%] h-[124%] w-full object-cover"
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={reduceMotion ? undefined : { y: videoY }}
      >
        <source src={heroVideo} type="video/mp4" />
      </motion.video>

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_30%,rgba(27,14,10,0.12)_100%)]"
        style={reduceMotion ? undefined : { y: overlayY }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 top-[38%] bg-[radial-gradient(circle_at_20%_100%,rgba(211,108,171,0.34),transparent_22%),radial-gradient(circle_at_78%_42%,rgba(255,255,255,0.34),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.06)_100%)]"
        style={reduceMotion ? undefined : { y: overlayY }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex justify-center px-4 pt-8 sm:pt-10">
          <Link to="/book/service">
            <Button
              type="button"
              className="min-h-11 rotate-[-15deg] rounded-none border border-[#7f2478] bg-[#7f2478] px-6 text-white shadow-[0_14px_28px_rgba(86,22,82,0.28)]"
            >
              <span className="inline-flex items-center gap-2 tracking-[0.16em]">
                Click to Book
                <ArrowRight size={16} />
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 sm:px-6">
          <motion.div
            className="hero-note max-w-[48rem] rounded-[2.25rem] bg-white px-6 py-5 text-[#2d221d] shadow-[0_20px_60px_rgba(48,30,19,0.12)] sm:px-8 sm:py-7"
            style={reduceMotion ? undefined : { y: bubbleY }}
          >
            <p className="text-[1.7rem] leading-[1.45] sm:text-[2.2rem]">
              Welcome to Pastel Nail Salon.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
