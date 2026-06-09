import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";

export function MobileStickyCTA({
  title,
  subtitle,
  cta,
  onClick,
  disabled,
  backLabel,
  onBack,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  backLabel?: string;
  onBack?: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 110, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 110, opacity: 0 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stroke/85 bg-surface/94 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text">{title}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{subtitle}</p>
            </div>
            {backLabel && onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-stroke/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-rich"
              >
                {backLabel}
              </button>
            ) : null}
          </div>
          <Button fullWidth onClick={onClick} disabled={disabled}>
            {cta}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
