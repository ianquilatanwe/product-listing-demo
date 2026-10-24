"use client";

import { useMemo, useRef, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Banner } from "@/components/layout/Banner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CardSkeleton } from "@/components/products/CardSkeleton";
import { Pagination } from "@/components/products/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { QuickView } from "@/components/products/QuickView";
import { Toolbar } from "@/components/products/Toolbar";
import { StateMessage } from "@/components/ui/StateMessage";
import { useCart } from "@/hooks/useCart";
import { useOnline } from "@/hooks/useOnline";
import { useProducts } from "@/hooks/useProducts";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useShortlist } from "@/hooks/useShortlist";
import { useUrlView } from "@/hooks/useUrlView";
import { browse } from "@/lib/catalog";
import type { Product } from "@/lib/products";

export default function ProductListPage() {
  useServiceWorker();
  const online = useOnline();
  const catalog = useProducts();
  const [view, updateView] = useUrlView();
  const cart = useCart(catalog.products);
  const shortlist = useShortlist();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const productsTop = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => [...new Set(catalog.products.map((p) => p.category))].sort(),
    [catalog.products],
  );
  const { visible, total, page, pageCount } = useMemo(
    () => browse(catalog.products, view, shortlist.ids),
    [catalog.products, view, shortlist.ids],
  );

  const scrollToProducts = () => productsTop.current?.scrollIntoView({ behavior: "smooth" });
  const clearFilters = () => updateView({ q: "", category: "", shortlist: false });
  const noShortlist = view.shortlist && shortlist.ids.length === 0;

  return (
    <>
      <Header cartCount={cart.count} onOpenCart={() => setCartOpen(true)} />
      {!online && (
        <p role="status" className="bg-ink px-4 py-2 text-center text-sm text-white">
          You&apos;re offline. Showing products saved on this device; your cart and shortlist are kept.
        </p>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1280px] px-4 focus:outline-none sm:px-6 xl:px-0">
        <Banner
          onBuy={() => {
            updateView({ q: "", category: "mobile-accessories", shortlist: false });
            scrollToProducts();
          }}
        />

        <div ref={productsTop} className="mt-10 scroll-mt-6 sm:mt-16">
          <Toolbar view={view} categories={categories} shortlistCount={shortlist.ids.length} onChange={updateView} />
        </div>

        <section aria-live="polite" aria-busy={catalog.status === "loading"} className="mt-8 sm:mt-12">
          {catalog.status === "loading" && (
            <>
              <p className="sr-only">Loading products…</p>
              <ul className="grid-products">
                {Array.from({ length: 8 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </ul>
            </>
          )}

          {catalog.status === "error" && (
            <StateMessage
              alert
              title={online ? "Couldn't load products" : "You're offline"}
              body={
                online
                  ? "Check your connection and try again."
                  : "There's no saved copy yet. Products will load as soon as you're back online."
              }
            >
              <button className="btn-primary px-6" disabled={!online} onClick={catalog.retry}>
                Try again
              </button>
            </StateMessage>
          )}

          {catalog.status === "done" && total === 0 && (
            <StateMessage
              title={noShortlist ? "Nothing shortlisted yet" : "No products found"}
              body={noShortlist ? "Tap the heart on any product to save it here." : "Try a different search or category."}
            >
              <button className="btn-secondary px-6" onClick={clearFilters}>
                Clear filters
              </button>
            </StateMessage>
          )}

          {visible.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted">
                Showing {visible.length} of {total} products
              </p>
              <ul className="grid-products">
                {visible.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    inCart={cart.qtyOf(p.id)}
                    shortlisted={shortlist.has(p.id)}
                    onAdd={() => cart.add(p)}
                    onShortlist={() => shortlist.toggle(p.id)}
                    onQuickView={() => setQuickView(p)}
                  />
                ))}
              </ul>
              <Pagination
                page={page}
                count={pageCount}
                onChange={(p) => {
                  updateView({ page: p });
                  scrollToProducts();
                }}
              />
            </>
          )}
        </section>
      </main>

      <QuickView
        product={quickView}
        inCart={quickView ? cart.qtyOf(quickView.id) : 0}
        shortlisted={!!quickView && shortlist.has(quickView.id)}
        onAdd={() => quickView && cart.add(quickView)}
        onShortlist={() => quickView && shortlist.toggle(quickView.id)}
        onClose={() => setQuickView(null)}
      />
      <CartDrawer
        open={cartOpen}
        lines={cart.lines}
        count={cart.count}
        online={online}
        onQty={cart.setQty}
        onCheckout={cart.clear}
        onClose={() => setCartOpen(false)}
      />
      <Footer />
    </>
  );
}
