import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister any existing service workers and clear caches so installed PWAs self-heal.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
