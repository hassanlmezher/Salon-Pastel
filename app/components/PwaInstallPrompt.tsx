"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const SESSION_DISMISSED_KEY = "pastel-pwa-install-dismissed";
const INSTALLED_KEY = "pastel-pwa-installed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;

  const platform = window.navigator.platform.toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();
  const iPadOS = platform === "macintel" && window.navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(userAgent) || iPadOS;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installed, setInstalled] = useState(false);
  const ios = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The app should continue normally if registration fails on an unsupported browser.
      });
    }
  }, []);

  useEffect(() => {
    const alreadyInstalled = isStandaloneMode() || window.localStorage.getItem(INSTALLED_KEY) === "true";
    setInstalled(alreadyInstalled);

    if (alreadyInstalled || window.sessionStorage.getItem(SESSION_DISMISSED_KEY) === "true") {
      return;
    }

    if (ios) {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, "true");
      setInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [ios]);

  const closePrompt = () => {
    window.sessionStorage.setItem(SESSION_DISMISSED_KEY, "true");
    setVisible(false);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      window.localStorage.setItem(INSTALLED_KEY, "true");
      setInstalled(true);
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (installed || !visible || (!ios && !deferredPrompt)) {
    return null;
  }

  return (
    <div className="pwaInstallShell" role="dialog" aria-modal="false" aria-labelledby="pwa-install-title">
      <div className="pwaInstallCard">
        <div className="pwaInstallIcon" aria-hidden="true">
          P
        </div>
        <div className="pwaInstallContent">
          <p className="pwaInstallEyebrow">Pastel app</p>
          <h2 id="pwa-install-title">Install Pastel on your phone</h2>
          <p>
            Open booking faster from your home screen and use Pastel like a salon app.
          </p>

          {ios && showIosSteps ? (
            <div className="pwaInstallSteps" lang="en">
              To install the app: tap the Share button, then choose Add to Home Screen.
            </div>
          ) : null}

          <div className="pwaInstallActions">
            {ios ? (
              <button type="button" className="pwaInstallPrimary" onClick={() => setShowIosSteps(true)}>
                How to Install
              </button>
            ) : (
              <button type="button" className="pwaInstallPrimary" onClick={installApp}>
                Install App
              </button>
            )}
            <button type="button" className="pwaInstallSecondary" onClick={closePrompt}>
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
