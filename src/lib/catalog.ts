import { label, type Product } from "./products.ts";

// Rules for browsing the catalogue: what the shopper is looking at (the View),
// how it maps to the URL, and how the product list is filtered, sorted and
// paged for it. Plain functions, no React, so they're tested directly.

export const PAGE_SIZE = 12;

export const SORTS = {
  featured: { label: "Featured", compare: () => 0 },
  "price-asc": { label: "Price: low to high", compare: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", compare: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Top rated", compare: (a: Product, b: Product) => b.rating - a.rating },
};
export type SortKey = keyof typeof SORTS;

export type View = { q: string; category: string; sort: SortKey; shortlist: boolean; page: number };
export const DEFAULT_VIEW: View = { q: "", category: "", sort: "featured", shortlist: false, page: 1 };

/** Reads a View from a query string ("?category=laptops&page=2"); bad values fall back to defaults. */
export function parseView(search: string): View {
  const p = new URLSearchParams(search);
  const sort = p.get("sort") ?? "";
  const page = Math.floor(Number(p.get("page")));
  return {
    q: p.get("q") ?? "",
    category: p.get("category") ?? "",
    sort: sort in SORTS ? (sort as SortKey) : "featured",
    shortlist: p.get("shortlist") === "1",
    page: Number.isSafeInteger(page) && page > 1 ? page : 1,
  };
}

/** The query string for a View, leaving out defaults ("" for the default view). */
export function serializeView(v: View): string {
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.category) p.set("category", v.category);
  if (v.sort !== "featured") p.set("sort", v.sort);
  if (v.shortlist) p.set("shortlist", "1");
  if (v.page > 1) p.set("page", String(v.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * The products to show for a View. Search matches title, brand and category;
 * `page` is clamped to the last page, since a shared link may point past it.
 */
export function browse(products: Product[], view: View, shortlist: number[]) {
  const q = view.q.trim().toLowerCase();
  const results = products
    .filter((p) => !view.category || p.category === view.category)
    .filter((p) => !view.shortlist || shortlist.includes(p.id))
    .filter((p) => !q || `${p.title} ${p.brand ?? ""} ${p.category} ${label(p.category)}`.toLowerCase().includes(q))
    .sort(SORTS[view.sort].compare);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(view.page, pageCount);
  return {
    visible: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: results.length,
    page,
    pageCount,
  };
}
