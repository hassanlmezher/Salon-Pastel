import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";

const DEV_SERVICE_WORKER_CLEANUP_KEY = "pastel-dev-service-worker-cleaned";

async function configureServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (import.meta.env.PROD) {
    await navigator.serviceWorker.register("/sw.js");
    return;
  }

  const wasControlled = Boolean(navigator.serviceWorker.controller);
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => new URL(registration.scope).origin === window.location.origin)
      .map((registration) => registration.unregister()),
  );

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.filter((cacheName) => cacheName.startsWith("pastel-pwa-")).map((cacheName) => caches.delete(cacheName)),
    );
  }

  if (wasControlled && window.sessionStorage.getItem(DEV_SERVICE_WORKER_CLEANUP_KEY) !== "true") {
    window.sessionStorage.setItem(DEV_SERVICE_WORKER_CLEANUP_KEY, "true");
    window.location.reload();
    return;
  }

  window.sessionStorage.removeItem(DEV_SERVICE_WORKER_CLEANUP_KEY);
}

void configureServiceWorker().catch(() => {
  // Service-worker cleanup must never prevent the development app from rendering.
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
