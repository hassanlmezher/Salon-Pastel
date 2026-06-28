"use client";

import { useEffect, useRef, useState } from "react";
import { AdminSkeletonScreen } from "./AdminSkeletonScreen";

function isPrimaryNavigationClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isInternalUrl(url: URL) {
  return url.origin === window.location.origin;
}

function isSameLocation(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

export function AdminNavigationLoader() {
  const [visible, setVisible] = useState(false);
  const locationKeyRef = useRef("");
  const timeoutRef = useRef(0);

  useEffect(() => {
    locationKeyRef.current = `${window.location.pathname}${window.location.search}`;

    const startLoading = () => {
      window.clearTimeout(timeoutRef.current);
      locationKeyRef.current = `${window.location.pathname}${window.location.search}`;
      setVisible(true);
      timeoutRef.current = window.setTimeout(() => setVisible(false), 8000);
    };

    const hideWhenNavigationSettles = () => {
      const nextKey = `${window.location.pathname}${window.location.search}`;
      if (nextKey !== locationKeyRef.current) {
        locationKeyRef.current = nextKey;
        window.clearTimeout(timeoutRef.current);
        setVisible(false);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!isPrimaryNavigationClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".mobileAdminShell")) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href);
      if (!isInternalUrl(url) || isSameLocation(url)) return;

      startLoading();
    };

    const handleSubmit = (event: SubmitEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      if (!target.closest(".mobileAdminShell")) return;

      startLoading();
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    const interval = window.setInterval(hideWhenNavigationSettles, 80);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.clearInterval(interval);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return <AdminSkeletonScreen overlay />;
}
