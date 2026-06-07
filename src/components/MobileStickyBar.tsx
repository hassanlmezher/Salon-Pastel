import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";

type MobileStickyBarProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onPrimary: () => void;
  disabled?: boolean;
  backLabel?: string;
  onBack?: () => void;
};

export function MobileStickyBar({
  visible,
  title,
  subtitle,
  ctaLabel,
  onPrimary,
  disabled = false,
  backLabel,
  onBack,
}: MobileStickyBarProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-[rgba(247,240,233,0.88)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-20px_50px_rgba(58,40,18,0.14)] backdrop-blur-2xl lg:hidden"
        >
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
                  {title}
                </p>
                <p className="mt-1 text-sm text-taupe">{subtitle}</p>
              </div>
              {backLabel && onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-taupe transition hover:bg-white/60"
                >
                  {backLabel}
                </button>
              ) : null}
            </div>
            <Button fullWidth disabled={disabled} onClick={onPrimary}>
              {ctaLabel}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
