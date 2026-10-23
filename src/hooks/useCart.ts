import { useMemo } from "react";
import type { Product } from "@/lib/products";
import { useStoredState } from "./useStoredState";

export type CartLine = { product: Product; qty: number };

/**
 * The cart, saved on the device. Quantities never exceed stock; setting a
 * quantity to 0 removes the line. Lines for products not in `products`
 * (e.g. before the catalogue loads) are kept but not listed.
 */
export function useCart(products: Product[]) {
  const [items, setItems] = useStoredState<Record<number, number>>("cart", {});
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const lines: CartLine[] = Object.entries(items).flatMap(([id, qty]) => {
    const product = byId.get(Number(id));
    return product ? [{ product, qty }] : [];
  });

  const setQty = (id: number, qty: number) =>
    setItems((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  return {
    lines,
    count: lines.reduce((sum, l) => sum + l.qty, 0),
    qtyOf: (id: number) => items[id] ?? 0,
    add: (p: Product) => setItems((c) => ({ ...c, [p.id]: Math.min(p.stock, (c[p.id] ?? 0) + 1) })),
    setQty,
    clear: () => setItems({}),
  };
}
