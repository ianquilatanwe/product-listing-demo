import { useEffect, useState } from "react";

const kindOf = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

/**
 * useState that survives reloads and offline sessions via localStorage.
 * Reads after mount so the server-rendered HTML and first client render match.
 */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const kind = kindOf(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      const parsed = saved && JSON.parse(saved);
      // Only take data of the same kind (array, object…) as the initial value,
      // so one bad entry can't crash every render from now on.
      if (saved && kindOf(parsed) === kind) setValue(parsed);
    } catch {
      // Private mode or corrupt data: start fresh.
    }
    setLoaded(true);
  }, [key, kind]);

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
