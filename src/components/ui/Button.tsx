import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const styles = {
    primary:
      "bg-button-gradient text-white shadow-luxe",
    secondary:
      "border border-stroke bg-surface text-text shadow-soft",
    ghost: "bg-transparent text-text-secondary",
  }[variant];

  return (
    <motion.button
      whileHover={disabled || reducedMotion ? undefined : { y: -2 }}
      whileTap={disabled || reducedMotion ? undefined : { scale: 0.985 }}
      className={cn(
        "min-h-12 rounded-full border border-transparent px-5 text-sm font-semibold uppercase tracking-[0.18em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-rich focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        styles,
        fullWidth && "w-full",
        disabled && "cursor-not-allowed opacity-45 shadow-none",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
