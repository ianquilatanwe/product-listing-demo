"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartDrawer, QuickView } from "@/components/Dialogs";
import { CardSkeleton, ProductCard } from "@/components/ProductCard";
import { useOnline, useServiceWorker, useStoredState } from "@/lib/hooks";
import { label, PRODUCTS_URL, type Product } from "@/lib/products";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; products: Product[] };

const PAGE_SIZE = 12;
const NONE: Product[] = [];

const SORTS = {
  featured: { label: "Featured", fn: () => 0 },
  "price-asc": { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Top rated", fn: (a: Product, b: Product) => b.rating - a.rating },
};
type SortKey = keyof typeof SORTS;

// What the shopper is looking at. It lives in the URL
// (?q=&category=&sort=&shortlist=1&page=2) so refresh, Back/Forward and
// shared links all keep it.
type View = { q: string; category: string; sort: SortKey; shortlist: boolean; page: number };
const DEFAULT_VIEW: View = { q: "", category: "", sort: "featured", shortlist: false, page: 1 };

function viewFromUrl(): View {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get("sort") ?? "";
  return {
    q: p.get("q") ?? "",
    category: p.get("category") ?? "",
    sort: sort in SORTS ? (sort as SortKey) : "featured",
    shortlist: p.get("shortlist") === "1",
    page: Math.max(1, Math.floor(Number(p.get("page"))) || 1),
  };
}

function searchFromView(v: View) {
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.category) p.set("category", v.category);
  if (v.sort !== "featured") p.set("sort", v.sort);
  if (v.shortlist) p.set("shortlist", "1");
  if (v.page > 1) p.set("page", String(v.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default function ProductListPage() {
  useServiceWorker();
  const online = useOnline();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0); // bumped to refetch
  const [view, setView] = useState(DEFAULT_VIEW);
  const [urlRead, setUrlRead] = useState(false);
  const pushHistory = useRef(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  // Saved on the device, so they survive reloads and offline sessions.
  const [cart, setCart] = useStoredState<Record<number, number>>("cart", {});
  const [shortlist, setShortlist] = useStoredState<number[]>("shortlist", []);
  const toolbar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    // Skeletons only on first load; a refetch keeps showing the current list.
    setState((s) => (s.status === "done" ? s : { status: "loading" }));
    // Give up after 10 s so a stalled network shows the error state, not endless skeletons.
    fetch(PRODUCTS_URL, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]) })
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
    const refresh = () => setAttempt((n) => n + 1);
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, []);

  // URL → view: on load and on Back/Forward.
  useEffect(() => {
    const sync = () => setView(viewFromUrl());
    sync();
    setUrlRead(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // View → URL. Typing a search replaces the history entry; other changes add
  // one, so Back steps through categories and pages, not every keystroke.
  useEffect(() => {
    if (!urlRead) return; // don't wipe the incoming URL before it's been read
    const search = searchFromView(view);
    if (search === window.location.search) return;
    const url = search || window.location.pathname;
    if (pushHistory.current) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [view, urlRead]);

  /** Change the view; any change other than the page goes back to page 1. */
  const update = (patch: Partial<View>, { push = true } = {}) => {
    pushHistory.current = push;
    setView((v) => ({ ...v, page: 1, ...patch }));
  };

  const all = state.status === "done" ? state.products : NONE;
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const categories = useMemo(() => [...new Set(all.map((p) => p.category))].sort(), [all]);
  const results = useMemo(() => {
    const q = view.q.trim().toLowerCase();
    return all
      .filter((p) => !view.category || p.category === view.category)
      .filter((p) => !view.shortlist || shortlist.includes(p.id))
      .filter((p) => !q || `${p.title} ${p.brand ?? ""} ${p.category}`.toLowerCase().includes(q))
      .sort(SORTS[view.sort].fn);
  }, [all, view.q, view.category, view.sort, view.shortlist, shortlist]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(view.page, pageCount); // a shared link may point past the last page
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cartLines = Object.entries(cart).flatMap(([id, qty]) => {
    const product = byId.get(Number(id));
    return product ? [{ product, qty }] : [];
  });
  const cartCount = cartLines.reduce((sum, l) => sum + l.qty, 0);

  const clearFilters = () => update({ q: "", category: "", shortlist: false });
  const scrollToProducts = () => toolbar.current?.scrollIntoView({ behavior: "smooth" });

  const addToCart = (p: Product) => setCart((c) => ({ ...c, [p.id]: Math.min(p.stock, (c[p.id] ?? 0) + 1) }));
  const setQty = (id: number, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const toggleShortlist = (id: number) =>
    setShortlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-[#3a4980] px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to products
      </a>
      <Header cart={cartCount} onCart={() => setCartOpen(true)} />
      {!online && (
        <p role="status" className="bg-[#1d364d] px-4 py-2 text-center text-sm text-white">
          You&apos;re offline. Showing products saved on this device; your cart and shortlist are kept.
        </p>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1280px] px-4 focus:outline-none sm:px-6 xl:px-0">
        <Banner
          onBuy={() => {
            update({ q: "", category: "mobile-accessories", shortlist: false });
            scrollToProducts();
          }}
        />

        <div ref={toolbar} className="mt-10 flex scroll-mt-6 flex-wrap items-center justify-between gap-3 sm:mt-16">
          <div className="flex flex-wrap gap-[11px]">
            <label className="pill bg-[#ebedec] hover:bg-[#e2e5e4]">
              <span className="sr-only">Search products</span>
              <input
                type="search"
                value={view.q}
                onChange={(e) => update({ q: e.target.value }, { push: false })}
                placeholder="Search products"
                className="w-40 bg-transparent placeholder:text-[#475467] focus:outline-none"
              />
            </label>
            <Select
              label="Category"
              value={view.category}
              onChange={(category) => update({ category })}
              className="bg-[#ebedec] hover:bg-[#e2e5e4]"
              options={[["", "All categories"], ...categories.map((c) => [c, label(c)] as const)]}
            />
            <button
              onClick={() => update({ shortlist: !view.shortlist })}
              aria-pressed={view.shortlist}
              className={`pill motion-safe:transition ${view.shortlist ?"bg-[#3a4980] text-white" : "bg-[#ebedec] hover:bg-[#e2e5e4]"}`}
            >
              ♥ Shortlist{shortlist.length > 0 && ` (${shortlist.length})`}
            </button>
          </div>
          <Select
            label="Sort by"
            value={view.sort}
            onChange={(sort) => update({ sort: sort as SortKey })}
            className="border border-[#e0e0e0] bg-white hover:border-[#c4c9d1]"
            options={Object.entries(SORTS).map(([k, s]) => [k, s.label] as const)}
          />
        </div>

        <section aria-live="polite" aria-busy={state.status === "loading"} className="mt-8 sm:mt-12">
          {state.status === "loading" && (
            <>
              <p className="sr-only">Loading products…</p>
              <ul className="grid-products">
                {Array.from({ length: 8 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </ul>
            </>
          )}

          {state.status === "error" && (
            <Message
              alert
              title={online ? "Couldn't load products" : "You're offline"}
              body={
                online
                  ? "Check your connection and try again."
                  : "There's no saved copy yet. Products will load as soon as you're back online."
              }
            >
              <button className="btn-primary px-6" disabled={!online} onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
            </Message>
          )}

          {state.status === "done" && results.length === 0 && (
            <Message
              title={view.shortlist && shortlist.length === 0 ? "Nothing shortlisted yet" : "No products found"}
              body={
                view.shortlist && shortlist.length === 0
                  ? "Tap the heart on any product to save it here."
                  : "Try a different search or category."
              }
            >
              <button className="btn-secondary px-6" onClick={clearFilters}>
                Clear filters
              </button>
            </Message>
          )}

          {visible.length > 0 && (
            <>
              <p className="mb-4 text-sm text-[#667085]">
                Showing {visible.length} of {results.length} products
              </p>
              <ul className="grid-products">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    inCart={cart[p.id] ?? 0}
                    shortlisted={shortlist.includes(p.id)}
                    onAdd={() => addToCart(p)}
                    onShortlist={() => toggleShortlist(p.id)}
                    onQuickView={() => setQuickView(p)}
                  />
                ))}
              </ul>
              <Pagination
                page={page}
                count={pageCount}
                onChange={(p) => {
                  update({ page: p });
                  scrollToProducts();
                }}
              />
            </>
          )}
        </section>
      </main>

      <QuickView
        product={quickView}
        inCart={quickView ? (cart[quickView.id] ?? 0) : 0}
        shortlisted={!!quickView && shortlist.includes(quickView.id)}
        onAdd={() => quickView && addToCart(quickView)}
        onShortlist={() => quickView && toggleShortlist(quickView.id)}
        onClose={() => setQuickView(null)}
      />
      <CartDrawer
        open={cartOpen}
        lines={cartLines}
        online={online}
        onQty={setQty}
        onCheckout={() => setCart({})}
        onClose={() => setCartOpen(false)}
      />

      <footer className="gradient-lilac mt-20 px-4 py-16 text-center text-sm text-[#1d364d] sm:mt-28">
        <p className="text-2xl font-extrabold italic text-[#0d3356]">FashionHub</p>
        <p className="mt-4">
          Design:{" "}
          <a
            className="underline hover:text-[#3a4980]"
            href="https://www.figma.com/community/file/1206898292713093171/single-product-product-list-page"
          >
            Single Product &amp; Product List Page
          </a>{" "}
          by Kirit Goti (
          <a className="underline hover:text-[#3a4980]" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          ) · Data:{" "}
          <a className="underline hover:text-[#3a4980]" href="https://dummyjson.com">
            DummyJSON
          </a>
        </p>
        <p className="mt-2">
          Built by{" "}
          <a className="underline hover:text-[#3a4980]" href="https://github.com/ianquilatanwe">
            Ian Quilatan
          </a>
        </p>
      </footer>
    </>
  );
}

function Header({ cart, onCart }: { cart: number; onCart: () => void }) {
  return (
    <header className="border-b border-[#ededed]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 xl:px-20">
        <div className="flex items-center gap-[60px]">
          <p className="text-[26px] font-extrabold italic text-[#0d3356] sm:text-[32.8px]">FashionHub</p>
          {/* Static nav from the design: no pages behind these in the demo. */}
          <nav aria-label="Main" className="hidden gap-[50px] font-medium text-[#1d364d] lg:flex">
            <span>Category</span>
            <span>Brand</span>
            <span>Contact</span>
            <span>FAQ&rsquo;s</span>
          </nav>
        </div>
        <div className="flex items-center gap-[17px]">
          <button
            onClick={onCart}
            aria-label={`Open cart, ${cart} ${cart === 1 ? "item" : "items"}`}
            className="relative grid size-[50px] place-items-center rounded-full bg-[#f5f1ee] motion-safe:transition hover:bg-[#ece3db] active:scale-95"
          >
            <Image src="/bag.svg" alt="" width={21} height={21} />
            {cart > 0 && (
              <span
                key={cart}
                aria-hidden
                className="absolute -top-[3px] left-[32px] grid h-5 min-w-5 place-items-center rounded-full border-[1.5px] border-white bg-[#1d364d] px-1 text-[11px] font-semibold text-white motion-safe:animate-[pop_0.35s_ease-out]"
              >
                {cart}
              </span>
            )}
          </button>
          <span className="sr-only" role="status">
            {cart} {cart === 1 ? "item" : "items"} in cart
          </span>
          <div className="relative hidden size-[50px] place-items-center rounded-full bg-[#eeeff8] sm:grid">
            <Image src="/bell.svg" alt="" width={20} height={20} />
            <span className="absolute left-[29px] top-[2px] size-[10px] rounded-full border-[1.5px] border-white bg-[#d75951]" />
          </div>
          <div className="flex items-center gap-[14px]">
            <Image src="/avatar.png" alt="" width={50} height={50} className="size-[50px] rounded-full object-cover" />
            <div className="hidden flex-col gap-[7px] md:flex">
              <p className="text-xs font-medium text-[#667085]">Good Morning!</p>
              <p className="font-semibold text-[#1d364d]">Scarlet Johnson</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Banner({ onBuy }: { onBuy: () => void }) {
  return (
    <section className="gradient-lilac relative mt-6 flex min-h-[287px] items-center rounded-[18px] p-6 sm:mt-12 sm:px-[55px]">
      <div className="relative z-10 max-w-[377px]">
        <h1 className="text-[26px] font-bold text-[#3a4980] sm:text-[34px]">Grab Upto 50% Off On Selected Headphone</h1>
        <button
          onClick={onBuy}
          className="mt-6 h-[49px] w-[136px] rounded-full bg-[#3a4980] font-semibold text-white motion-safe:transition hover:bg-[#2f3c6c] hover:shadow-lg active:scale-95 sm:mt-11"
        >
          Buy Now
        </button>
      </div>
      {/* Same crop as the Figma frame: a 294×324 window onto a wider photo,
          37px taller than the banner so the head pops out of the top. */}
      <div className="absolute bottom-0 right-0 hidden h-[324px] w-[294px] overflow-hidden md:block lg:right-[176px]">
        <Image
          src="/hero.png"
          alt=""
          width={1200}
          height={675}
          priority
          className="absolute left-[-53.05%] top-[-13.45%] h-[113.45%] w-[221.81%] max-w-none"
        />
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
  className: string;
}) {
  return (
    <label className={`pill relative motion-safe:transition ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-5 capitalize focus:outline-none"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <Image src="/chevron.svg" alt="" width={14} height={14} className="pointer-events-none absolute right-[14px]" />
    </label>
  );
}

function Pagination({ page, count, onChange }: { page: number; count: number; onChange: (p: number) => void }) {
  if (count < 2) return null;
  // Up to 7 page numbers, kept centred on the current page.
  const start = Math.min(Math.max(1, page - 3), Math.max(1, count - 6));
  const pages = Array.from({ length: Math.min(7, count) }, (_, i) => start + i);
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-2 text-sm text-[#667085] sm:mt-[74px]">
      <button className="page-btn px-[10px]" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`page-btn w-10 font-semibold ${p === page ? "gradient-lilac border-transparent text-[#1d364d]" : ""}`}
        >
          {p}
        </button>
      ))}
      <button className="page-btn px-[10px] font-medium" disabled={page === count} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

function Message({
  title,
  body,
  alert = false,
  children,
}: {
  title: string;
  body: string;
  alert?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div role={alert ? "alert" : undefined} className="py-20 text-center">
      <h2 className="text-xl font-semibold text-[#1d364d]">{title}</h2>
      <p className="mt-2 text-[#667085]">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
