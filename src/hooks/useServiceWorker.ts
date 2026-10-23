import { useEffect } from "react";

/** Registers public/sw.js (production only, so dev reloads stay fresh). */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
}
