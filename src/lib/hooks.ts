import { useEffect, useState, useSyncExternalStore } from "react";

/** True while the browser has a network connection; updates live. */
export function useOnline() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("online", onChange);
      window.addEventListener("offline", onChange);
      return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
      };
    },
    () => navigator.onLine,
    () => true, // server render: assume online
  );
}

/**
 * useState that survives reloads and offline sessions via localStorage.
 * Reads after mount so the server-rendered HTML and first client render match.
 */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch {
      // Private mode or corrupt data: start fresh.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return; // don't overwrite saved data with the initial value
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the in-memory state still works.
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;
}

/** Registers public/sw.js (production only, so dev reloads stay fresh). */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
}
