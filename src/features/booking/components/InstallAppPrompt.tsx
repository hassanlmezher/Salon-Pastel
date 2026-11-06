import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Mode = "android" | "android-steps" | "ios" | "in-app" | null;

let earlyInstallEvent: BeforeInstallPromptEvent | null = null;
const INSTALL_READY_EVENT = "pastel-install-ready";

/** Called at startup: keeps Chrome's install offer until the card is ready to use it. */
export function captureInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    earlyInstallEvent = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event(INSTALL_READY_EVENT));
  });
  window.addEventListener("appinstalled", () => {
    earlyInstallEvent = null;
  });
}

const DISMISSED_KEY = "pastel-install-dismissed-at";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 1500;

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode: the card simply shows again next visit.
  }
}

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function recentlyDismissed() {
  const at = Number(readStorage(DISMISSED_KEY) ?? 0);
  return Date.now() - at < DISMISS_DAYS * 86_400_000;
}

function detectPhone() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  // Instagram, Facebook and TikTok open links in their own browser, which can't install apps.
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|musical_ly/i.test(ua);
  return { ios, android, inApp };
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="inline-block align-[-3px]">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

/**
 * On phones, offers to add the booking site to the home screen: Android gets the real install
 * button, iPhone (which has none) gets the two Safari steps, and in-app browsers are told to open
 * the site in Safari or Chrome first. Hidden on computers, once installed, and for a week after "Not now".
 */
export function InstallAppPrompt() {
  const [mode, setMode] = useState<Mode>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [top, setTop] = useState(12);

  // Sits just under the page header so the logo button stays tappable.
  useEffect(() => {
    if (!mode) return;
    const header = document.querySelector("header");
    setTop(Math.max(12, Math.round((header?.getBoundingClientRect().bottom ?? 0) + 8)));
  }, [mode]);

  useEffect(() => {
    if (isInstalled() || recentlyDismissed()) return;
    const { ios, android, inApp } = detectPhone();
    if (!ios && !android) return;

    if (inApp) {
      const timer = window.setTimeout(() => setMode("in-app"), SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (ios) {
      const timer = window.setTimeout(() => setMode("ios"), SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    // Android Chrome offers a real install prompt; other Android browsers get the menu steps.
    // Browsers that never offer installation get the menu steps after a few seconds instead.
    const fallback = window.setTimeout(() => setMode((current) => current ?? "android-steps"), 4000);
    const useInstallEvent = () => {
      if (!earlyInstallEvent) return;
      window.clearTimeout(fallback);
      setInstallEvent(earlyInstallEvent);
      setMode("android");
    };
    useInstallEvent();
    const onInstalled = () => setMode(null);
    window.addEventListener(INSTALL_READY_EVENT, useInstallEvent);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener(INSTALL_READY_EVENT, useInstallEvent);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    writeStorage(DISMISSED_KEY, String(Date.now()));
    setMode(null);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "dismissed") writeStorage(DISMISSED_KEY, String(Date.now()));
    earlyInstallEvent = null;
    setInstallEvent(null);
    setMode(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="install-title"
      style={{ top }}
      className="fixed inset-x-3 z-40 mx-auto max-w-md motion-safe:animate-[install-in_260ms_ease-out]"
    >
      <div className="border border-[#e7c9c2] bg-[#fffaf6] p-4 text-[#231814] shadow-[0_18px_44px_rgba(97,58,24,0.22)]">
        <div className="flex items-start gap-3">
          <img src="/pwa-icon-192.png" alt="" width={48} height={48} className="h-12 w-12 flex-none" />
          <div className="min-w-0 flex-1">
            <p id="install-title" className="font-display text-[1.3rem] font-semibold leading-tight">
              Get the Pastel app
            </p>
            <p lang="ar" dir="rtl" className="text-sm text-[#6d5648]">حمّلي تطبيق Pastel</p>
            <p className="mt-1 text-sm leading-5 text-[#6d5648]">
              Book your next visit in one tap from your home screen. It's free.
            </p>
          </div>
        </div>

        {mode === "ios" ? (
          <ol className="mt-3 space-y-1.5 border-t border-[#ead5cd] pt-3 text-sm leading-5">
            <li>
              1. Tap <strong>Share</strong> <ShareIcon /> at the bottom of Safari
              <span lang="ar" dir="rtl" className="block text-[#6d5648]">اضغطي على زر المشاركة</span>
            </li>
            <li>
              2. Choose <strong>Add to Home Screen</strong>
              <span lang="ar" dir="rtl" className="block text-[#6d5648]">ثم اختاري «إضافة إلى الشاشة الرئيسية»</span>
            </li>
          </ol>
        ) : null}

        {mode === "android-steps" ? (
          <ol className="mt-3 space-y-1.5 border-t border-[#ead5cd] pt-3 text-sm leading-5">
            <li>
              1. Tap the menu <strong>⋮</strong> at the top of your browser
              <span lang="ar" dir="rtl" className="block text-[#6d5648]">اضغطي على القائمة ⋮</span>
            </li>
            <li>
              2. Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>
              <span lang="ar" dir="rtl" className="block text-[#6d5648]">ثم اختاري «تثبيت التطبيق»</span>
            </li>
          </ol>
        ) : null}

        {mode === "in-app" ? (
          <p className="mt-3 border-t border-[#ead5cd] pt-3 text-sm leading-5">
            To install it, open this page in <strong>Safari</strong> or <strong>Chrome</strong> first: tap the <strong>⋯</strong> menu, then
            <strong> Open in browser</strong>.
            <span lang="ar" dir="rtl" className="block text-[#6d5648]">افتحي الصفحة في Safari أو Chrome أولاً</span>
          </p>
        ) : null}

        <div className="mt-3 flex gap-2">
          {mode === "android" ? (
            <button
              type="button"
              onClick={install}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-[#a3635c] px-4 text-sm font-semibold text-white active:bg-[#8f544e]"
            >
              <span>Install app</span>
              <span lang="ar" dir="rtl" className="font-normal">تثبيت</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className={`flex min-h-11 items-center justify-center border border-[#e7c9c2] bg-white px-4 text-sm font-semibold text-[#6d3f1f] ${mode === "android" ? "" : "flex-1"}`}
          >
            {mode === "android" ? "Not now" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
