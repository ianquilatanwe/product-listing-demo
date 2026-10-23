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
    setState((s) => (s.status === "done" ? s : { status: "loading" }));
    fetch(PRODUCTS_URL, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(TIMEOUT_MS)]) })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { products: Product[] }) => setState({ status: "done", products: data.products }))
      .catch((err) => {
        if (err.name !== "AbortError") setState((s) => (s.status === "done" ? s : { status: "error" }));
      });
    return () => controller.abort();
  }, [attempt]);

  // Coming back online refreshes the data (and recovers from an error).
  useEffect(() => {
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [retry]);

  return { status: state.status, products: state.status === "done" ? state.products : NONE, retry };
}
