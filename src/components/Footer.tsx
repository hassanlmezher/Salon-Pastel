export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-center sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:text-left">
        <div>
          <p className="font-display text-4xl text-ink">Salon Pastel</p>
          <p className="mt-2 text-sm text-taupe">
            Elegant treatments. Soft rituals. Thoughtful booking.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.3em] text-taupe lg:justify-end">
          <a href="#services" className="transition hover:text-gold-600">
            Services
          </a>
          <a href="#availability" className="transition hover:text-gold-600">
            Availability
          </a>
          <a href="#summary" className="transition hover:text-gold-600">
            Summary
          </a>
        </div>
      </div>
    </footer>
  );
}
