import { useEffect, useRef, useState } from "react";

type Platform = "android" | "ios" | "other";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

const DISMISSED_KEY = "pastel-install-dismissed";
const EXPIRY_DAYS = 14;

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return !isNaN(ts) && Date.now() - ts < EXPIRY_DAYS * 86400000;
  } catch { return false; }
}

function markDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch { /* */ }
}

function ShareIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" className="inline-block">
      <path d="M7 0L3.5 3.5l1.05 1.05L6.25 2.8V10.5h1.5V2.8l1.7 1.75L10.5 3.5 7 0z" />
      <path d="M1 6h2V4.5H1C.45 4.5 0 4.95 0 5.5v9c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1h-2V6h2v8.5H1V6z" />
    </svg>
  );
}

function IOSInstallSheet({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Install Pastel app" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div onClick={onDismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(2px)" }} aria-hidden="true" />

      {/* Sheet */}
      <div style={{ position: "relative", background: "#fffaf6", borderRadius: "1.5rem 1.5rem 0 0", padding: "1.25rem 1.5rem 2.5rem", maxWidth: "28rem", margin: "0 auto", width: "100%", boxShadow: "0 -8px 40px rgba(97,58,24,0.18)", animation: "pwa-slide-up 320ms cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Drag handle */}
        <div style={{ width: "2.5rem", height: "4px", background: "#d7c4bc", borderRadius: "9999px", margin: "0 auto 1.25rem" }} />

        {/* Close btn */}
        <button type="button" onClick={onDismiss} aria-label="Close" style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "#8a6b5e", padding: "4px" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src="/apple-icon.png" alt="Pastel" style={{ width: "3.5rem", height: "3.5rem", flexShrink: 0, boxShadow: "0 4px 12px rgba(97,58,24,0.2)", borderRadius: "0.75rem" }} />
          <div>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", fontWeight: 600, color: "#4d2a16", margin: 0 }}>Install Pastel</p>
            <p style={{ fontSize: "0.8rem", color: "#7d5a50", margin: "0.25rem 0 0" }}>Add to Home Screen for reminders & fast access</p>
          </div>
        </div>

        <div style={{ height: "1px", background: "#ead5cd", margin: "1.25rem 0" }} />

        {/* Steps */}
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            <span>Tap the <span style={{ color: "#007aff", fontWeight: 600 }}><ShareIcon /> Share</span> button at the bottom of Safari.</span>,
            <span>Scroll and tap <strong style={{ color: "#4d2a16" }}>"Add to Home Screen"</strong>.</span>,
            <span>Tap <strong style={{ color: "#4d2a16" }}>"Add"</strong> in the top-right corner.</span>,
          ].map((step, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <span style={{ flexShrink: 0, width: "1.5rem", height: "1.5rem", background: "#f6c9b8", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#4d2a16", marginTop: "1px" }}>{i + 1}</span>
              <p style={{ fontSize: "0.875rem", lineHeight: "1.4", color: "#4d3330", margin: 0 }}>{step}</p>
            </li>
          ))}
        </ol>

        {/* Arabic note */}
        <p lang="ar" dir="rtl" style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#8a6b5e", textAlign: "right", lineHeight: "1.6" }}>
          لتثبيت التطبيق: اضغطي على <strong style={{ color: "#4d2a16" }}>مشاركة ← إضافة إلى الشاشة الرئيسية</strong>
        </p>
      </div>

      <style>{`
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function AndroidInstallBanner({ onInstall, onDismiss, installing }: { onInstall: () => void; onDismiss: () => void; installing: boolean }) {
  return (
    <div role="banner" style={{ position: "fixed", insetInline: 0, bottom: 0, zIndex: 9999, background: "#fffaf6", borderTop: "1px solid #ead5cd", boxShadow: "0 -4px 24px rgba(97,58,24,0.14)", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", animation: "pwa-slide-up 340ms cubic-bezier(0.16,1,0.3,1) both" }}>
      <img src="/pwa-icon-192.png" alt="Pastel" style={{ width: "3rem", height: "3rem", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#3d2113", margin: 0 }}>Install Pastel</p>
        <p style={{ fontSize: "0.75rem", color: "#7d5a50", margin: "2px 0 0", lineHeight: 1.3 }}>Get appointment reminders on your phone</p>
        <p lang="ar" dir="rtl" style={{ fontSize: "0.65rem", color: "#a08070", margin: "2px 0 0" }}>احصلي على تذكيرات مواعيدك</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
        <button type="button" onClick={onInstall} disabled={installing} style={{ background: "#8a4545", color: "#fff", border: "none", borderRadius: "9999px", padding: "0.375rem 1rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(138,69,69,0.3)", opacity: installing ? 0.6 : 1 }}>
          {installing ? "Installing…" : "Install"}
        </button>
        <button type="button" onClick={onDismiss} style={{ background: "none", border: "none", fontSize: "0.65rem", color: "#9b8070", textDecoration: "underline", cursor: "pointer", padding: 0 }}>
          Not now
        </button>
      </div>
      <style>{`
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [showIOS, setShowIOS] = useState(false);
  const [showAndroid, setShowAndroid] = useState(false);
  const [installing, setInstalling] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;
    const p = detectPlatform();
    setPlatform(p);

    if (p === "ios") {
      const t = setTimeout(() => setShowIOS(true), 2500);
      return () => clearTimeout(t);
    }
    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        deferredPrompt.current = e as BeforeInstallPromptEvent;
        setTimeout(() => setShowAndroid(true), 2500);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  useEffect(() => {
    const handler = () => { setShowAndroid(false); deferredPrompt.current = null; };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt.current) return;
    setInstalling(true);
    try {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") { setShowAndroid(false); deferredPrompt.current = null; }
    } finally { setInstalling(false); }
  }

  function handleDismiss() { markDismissed(); setShowIOS(false); setShowAndroid(false); }

  if (platform === "other") return null;

  return (
    <>
      {showIOS && <IOSInstallSheet onDismiss={handleDismiss} />}
      {showAndroid && <AndroidInstallBanner onInstall={handleAndroidInstall} onDismiss={handleDismiss} installing={installing} />}
    </>
  );
}
