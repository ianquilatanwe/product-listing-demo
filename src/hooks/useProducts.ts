import { useCallback, useEffect, useState } from "react";
import { PRODUCTS_URL, type Product } from "@/lib/products";

const TIMEOUT_MS = 10_000;
const NONE: Product[] = [];

/**
 * The product catalogue. `status` is "loading" only until the first success;
 * later refreshes (retry, coming back online) keep showing the current list.
 * A request that stalls for 10 s ends in "error" instead of endless skeletons.
 */
export function useProducts() {
  const [state, setState] = useState<{ status: "loading" | "error" } | { status: "done"; products: Product[] }>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    // A stall aborts with TimeoutError (shown as an error); unmount/retry aborts
    // with AbortError (ignored). Hand-rolled because AbortSignal.any needs Safari 17.4+.
    const timeout = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), TIMEOUT_MS);
    setState((s) => (s.status === "done" ? s : { status: "loading" }));
    fetch(PRODUCTS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { products: Product[] }) => setState({ status: "done", products: data.products }))
      .catch((err) => {
        if (err.name !== "AbortError") setState((s) => (s.status === "done" ? s : { status: "error" }));
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  // Coming back online refreshes the data (and recovers from an error).
  useEffect(() => {
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [retry]);

  return { status: state.status, products: state.status === "done" ? state.products : NONE, retry };
}
