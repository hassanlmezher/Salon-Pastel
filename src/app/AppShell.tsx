import { Link, Outlet } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-text"
      >
        Skip to content
      </a>
      <header className="border-b border-black/5 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <p className="font-display text-[48px] leading-none text-[#8d4f8c] sm:text-[64px]">Pastel</p>
            <p className="-mt-1 pl-1 text-[11px] uppercase tracking-[0.28em] text-text-secondary">
              Nail and beauty lounge
            </p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.16em] text-text-secondary lg:flex">
            <Link to="/" className="transition hover:text-text">
              Home
            </Link>
            <a href="#hero" className="transition hover:text-text">
              Hero
            </a>
            <a href="mailto:hello@salonpastel.co.uk" className="transition hover:text-text">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 top-28 z-50 flex justify-center px-4 sm:top-32 lg:top-36">
        <Button
          type="button"
          onClick={() => {
            document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="pointer-events-auto min-h-11 rotate-[-12deg] rounded-none border border-[#7f2478] bg-[#7f2478] px-5 text-white shadow-[0_16px_34px_rgba(86,22,82,0.28)]"
        >
          Book Appointment
        </Button>
      </div>

      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
