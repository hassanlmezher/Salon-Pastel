import { Link, Outlet } from "react-router-dom";

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
        <div className="mx-auto flex max-w-[88rem] items-center px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <p className="font-display text-[48px] leading-none text-[#8d4f8c] sm:text-[64px]">Pastel</p>
            <p className="-mt-1 pl-1 text-[11px] uppercase tracking-[0.28em] text-[#cdb99f]">
              Nail and beauty lounge
            </p>
          </Link>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
