import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function AppShell() {
  const { pathname } = useLocation();

  // Each new page starts at the top instead of keeping the previous page's scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-text"
      >
        Skip to content
      </a>
      <div id="main-content">
        <Outlet />
      </div>
    </div>
  );
}
