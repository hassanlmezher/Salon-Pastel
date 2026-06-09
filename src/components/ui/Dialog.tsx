import { AnimatePresence, motion } from "framer-motion";

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end bg-[rgba(46,39,35,0.35)] p-4 sm:place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-lg rounded-[28px] border border-stroke bg-surface p-6 shadow-[0_24px_60px_rgba(46,39,35,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-display text-4xl text-text">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
