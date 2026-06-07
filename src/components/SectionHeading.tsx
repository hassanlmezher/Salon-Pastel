import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="max-w-2xl"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gold-600">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-5xl leading-none text-ink sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-taupe sm:text-lg">
        {description}
      </p>
    </motion.div>
  );
}
