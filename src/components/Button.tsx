import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type ButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

const MotionButton = motion.button;

export function Button({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "bg-gold-gradient text-white shadow-luxe hover:brightness-105",
    secondary:
      "border border-gold-200 bg-white/70 text-ink shadow-soft hover:border-gold-300 hover:bg-white",
    ghost:
      "text-taupe hover:bg-white/50",
  }[variant];

  return (
    <MotionButton
      whileHover={disabled ? undefined : { y: -2, boxShadow: "0 20px 35px rgba(155, 116, 44, 0.22)" }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled}
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-[0.24em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f0e9]",
        variantClasses,
        fullWidth ? "w-full" : "",
        disabled ? "cursor-not-allowed opacity-45 shadow-none" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </MotionButton>
  );
}
