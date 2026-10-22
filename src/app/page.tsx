"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  category: string;
  brand?: string;
  thumbnail: string;
};

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; products: Product[] };

// limit=0 returns the whole catalogue (~200 items), so search, category,
// sort and pagination all run in the browser on a single request.
const API =
  "https://dummyjson.com/products?limit=0&select=title,price,rating,category,brand,thumbnail";
const PAGE_SIZE = 12;
const NONE: Product[] = [];

const SORTS = {
  featured: { label: "Featured", fn: () => 0 },
  "price-asc": { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Top rated", fn: (a: Product, b: Product) => b.rating - a.rating },
};
type SortKey = keyof typeof SORTS;

const label = (slug: string) => slug.replace(/-/g, " ");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function ProductListPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0); // bumped by "Try again" to refetch
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState(0);
  const [shortlist, setShortlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(API, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { products: Product[] }) => setState({ status: "done", products: data.products }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  const all = state.status === "done" ? state.products : NONE;
  const categories = useMemo(() => [...new Set(all.map((p) => p.category))].sort(), [all]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((p) => !category || p.category === category)
      .filter((p) => !q || `${p.title} ${p.brand ?? ""} ${p.category}`.toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [all, query, category, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Every filter change goes back to page 1.
  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const toggleShortlist = (id: number) =>
    setShortlist((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <>
      <Header cart={cart} />

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 xl:px-0">
        <Banner />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 sm:mt-16">
          <div className="flex flex-wrap gap-[11px]">
            <label className="pill bg-[#ebedec]">
              <span className="sr-only">Search products</span>
              <input
                type="search"
                value={query}
                onChange={(e) => filter(setQuery)(e.target.value)}
                placeholder="Search products"
                className="w-40 bg-transparent placeholder:text-[#667085] focus:outline-none"
              />
            </label>
            <Select
              label="Category"
              value={category}
              onChange={filter(setCategory)}
              className="bg-[#ebedec]"
              options={[["", "All categories"], ...categories.map((c) => [c, label(c)] as const)]}
            />
          </div>
          <Select
            label="Sort by"
            value={sort}
            onChange={filter((v: string) => setSort(v as SortKey))}
            className="border border-[#e0e0e0] bg-white"
            options={Object.entries(SORTS).map(([k, s]) => [k, s.label] as const)}
          />
        </div>

        <section aria-live="polite" aria-busy={state.status === "loading"} className="mt-8 sm:mt-12">
          {state.status === "loading" && (
            <ul className="grid-products">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="h-[488px] animate-pulse rounded-[18.48px] bg-[#f7f5f7]" />
              ))}
            </ul>
          )}

          {state.status === "error" && (
            <Message title="Couldn't load products" body="Check your connection and try again.">
              <button className="btn-primary px-6" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </button>
            </Message>
          )}

          {state.status === "done" && results.length === 0 && (
            <Message title="No products found" body="Try a different search or category.">
              <button
                className="btn-secondary px-6"
                onClick={() => {
                  setQuery("");
                  setCategory("");
                  setPage(1);
                }}
              >
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
                    shortlisted={shortlist.has(p.id)}
                    onAdd={() => setCart((n) => n + 1)}
                    onShortlist={() => toggleShortlist(p.id)}
                  />
                ))}
              </ul>
              <Pagination page={page} count={pageCount} onChange={setPage} />
            </>
          )}
        </section>
      </main>

      <footer className="gradient-lilac mt-20 px-4 py-16 text-center text-sm text-[#1d364d] sm:mt-28">
        <p className="text-2xl font-extrabold italic text-[#0d3356]">FashionHub</p>
        <p className="mt-4">
          Design:{" "}
          <a
            className="underline"
            href="https://www.figma.com/community/file/1206898292713093171/single-product-product-list-page"
          >
            Single Product &amp; Product List Page
          </a>{" "}
          by Kirit Goti (
          <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          ) · Data:{" "}
          <a className="underline" href="https://dummyjson.com">
            DummyJSON
          </a>
        </p>
        <p className="mt-2">
          Built by{" "}
          <a className="underline" href="https://github.com/ianquilatanwe">
            Ian Quilatan
          </a>
        </p>
      </footer>
    </>
  );
}

function Header({ cart }: { cart: number }) {
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
          <div className="relative grid size-[50px] place-items-center rounded-full bg-[#f5f1ee]">
            <Image src="/bag.svg" alt="" width={21} height={21} />
            <span className="sr-only" role="status">
              Cart: {cart} {cart === 1 ? "item" : "items"}
            </span>
            {cart > 0 && (
              <span
                aria-hidden
                className="absolute -top-[3px] left-[32px] grid h-5 min-w-5 place-items-center rounded-full border-[1.5px] border-white bg-[#1d364d] px-1 text-[11px] font-semibold text-white"
              >
                {cart}
              </span>
            )}
          </div>
          <div className="relative hidden size-[50px] place-items-center rounded-full bg-[#eeeff8] sm:grid">
            <Image src="/bell.svg" alt="" width={20} height={20} />
            <span className="absolute left-[29px] top-[2px] size-[10px] rounded-full border-[1.5px] border-white bg-[#d75951]" />
          </div>
          <div className="flex items-center gap-[14px]">
            <Image
              src="/avatar.png"
              alt=""
              width={50}
              height={50}
              className="size-[50px] rounded-full object-cover"
            />
            <div className="hidden flex-col gap-[7px] md:flex">
              <p className="text-xs font-medium text-[#c0c3c6]">Good Morning!</p>
              <p className="font-semibold text-[#1d364d]">Scarlet Johnson</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Banner() {
  return (
    <section className="gradient-lilac relative mt-6 flex min-h-[287px] items-center rounded-[18px] p-6 sm:mt-12 sm:px-[55px]">
      <div className="relative z-10 max-w-[377px]">
        <h1 className="text-[26px] font-bold text-[#3a4980] sm:text-[34px]">
          Grab Upto 50% Off On Selected Headphone
        </h1>
        <button className="mt-6 h-[49px] w-[136px] rounded-full bg-[#3a4980] font-semibold text-white sm:mt-11">
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
    <label className={`pill relative ${className}`}>
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

function ProductCard({
  product: p,
  shortlisted,
  onAdd,
  onShortlist,
}: {
  product: Product;
  shortlisted: boolean;
  onAdd: () => void;
  onShortlist: () => void;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-[18.48px] border-[1.54px] border-[#f7f5f7]">
      <div className="relative aspect-square bg-[#f7f5f7]">
        <Image
          src={p.thumbnail}
          alt={p.title}
          fill
          sizes="(min-width: 1280px) 305px, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-[12%]"
        />
        <button
          onClick={onShortlist}
          aria-pressed={shortlisted}
          aria-label={`Shortlist ${p.title}`}
          className={`absolute right-[15px] top-[15px] rounded-full p-[10.78px] ${shortlisted ? "bg-[#fde4e2]" : "bg-[#fcfcfd]"}`}
        >
          <Image src="/heart.svg" alt="" width={24.64} height={24.64} />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 title={p.title} className="line-clamp-1 text-lg font-medium text-[#667085]">
            {p.title}
          </h2>
          <p className="whitespace-nowrap text-lg font-bold text-[#344054]">{usd.format(p.price)}</p>
        </div>
        <p className="mt-1 text-sm capitalize text-[#98a2b3]">{p.brand ?? label(p.category)}</p>
        <div className="mt-3 flex items-center gap-2">
          <Stars rating={p.rating} />
          <span className="text-sm text-[#98a2b3]">({p.rating.toFixed(1)})</span>
        </div>
        <div className="mt-auto flex gap-[11px] pt-6">
          <button onClick={onAdd} className="btn-primary flex-1">
            Add To Cart
          </button>
          <button onClick={onShortlist} aria-pressed={shortlisted} className="btn-secondary flex-1">
            {shortlisted ? "Shortlisted" : "Add Shortlist"}
          </button>
        </div>
      </div>
    </li>
  );
}

// Gold stars clipped to the exact rating width over a faded row of the same icon.
function Stars({ rating }: { rating: number }) {
  const row = (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Image key={i} src="/star.svg" alt="" width={17} height={17} className="shrink-0" />
      ))}
    </span>
  );
  return (
    <span className="relative inline-block" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="opacity-25 grayscale">{row}</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(rating / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  );
}

function Pagination({ page, count, onChange }: { page: number; count: number; onChange: (p: number) => void }) {
  if (count < 2) return null;
  // Up to 7 page numbers, kept centred on the current page.
  const start = Math.min(Math.max(1, page - 3), Math.max(1, count - 6));
  const pages = Array.from({ length: Math.min(7, count) }, (_, i) => start + i);
  const go = (p: number) => {
    onChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-2 text-sm text-[#667085] sm:mt-[74px]">
      <button className="page-btn px-[10px]" disabled={page === 1} onClick={() => go(page - 1)}>
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className={`page-btn w-10 font-semibold ${p === page ? "gradient-lilac border-transparent text-[#1d364d]" : ""}`}
        >
          {p}
        </button>
      ))}
      <button className="page-btn px-[10px] font-medium" disabled={page === count} onClick={() => go(page + 1)}>
        Next
      </button>
    </nav>
  );
}

function Message({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div role={title.startsWith("Couldn") ? "alert" : undefined} className="py-20 text-center">
      <h2 className="text-xl font-semibold text-[#1d364d]">{title}</h2>
      <p className="mt-2 text-[#667085]">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
