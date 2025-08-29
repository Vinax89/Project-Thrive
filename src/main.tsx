import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { registerSW } from "virtual:pwa-register";

function rescheduleNotifications(reg: ServiceWorkerRegistration) {
  // Re-register periodic background sync and resend pending notifications.
  if ("periodicSync" in reg) {
    reg.periodicSync
      .register("notification-sync", { minInterval: 60 * 60 * 1000 })
      .catch(() => {
        /* periodic sync may be unavailable */
      });
  }

  const pending = JSON.parse(
    localStorage.getItem("pending-notifications") || "[]",
  );
  for (const note of pending) {
    reg.active?.postMessage({ type: "schedule", payload: note });
  }
}

registerSW({
  onRegistered(reg) {
    if (reg) rescheduleNotifications(reg);
  },
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    navigator.serviceWorker.ready.then((reg) => rescheduleNotifications(reg));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
