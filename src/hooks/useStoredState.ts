import { useEffect, useState } from "react";

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
