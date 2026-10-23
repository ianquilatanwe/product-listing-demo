"use client";

import { useEffect, useRef, useState } from "react";
import { label, usd, type Product } from "@/lib/products";
import { AddToCartButton, FadeImage, ShortlistButton, Spinner, StockChip, Stars } from "./ProductCard";

/**
 * Native <dialog>: the browser handles focus trapping, Esc to close and the
 * backdrop. Clicking the backdrop (the dialog element itself) also closes it.
 */
function Dialog({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className={`border-0 p-0 text-[#1d364d] ${className}`}
    >
      {children}
    </dialog>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="grid size-10 place-items-center rounded-full text-2xl leading-none text-[#667085] motion-safe:transition hover:bg-[#f2f4f7] active:scale-95"
    >
      ×
    </button>
  );
}

export function QuickView({
  product,
  inCart,
  shortlisted,
  onAdd,
  onShortlist,
  onClose,
}: {
  product: Product | null;
  inCart: number;
  shortlisted: boolean;
  onAdd: () => void;
  onShortlist: () => void;
  onClose: () => void;
}) {
  // Keep the last product rendered while the dialog animates closed.
  const [shown, setShown] = useState(product);
  if (product && product !== shown) setShown(product);
  const p = shown;

  return (
    <Dialog open={!!product} onClose={onClose} labelledBy="quick-view-title" className="modal m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[880px] overflow-y-auto rounded-[18px]">
      {p && (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-[#f7f5f7]">
            <FadeImage
              key={p.id}
              src={p.images[0] ?? p.thumbnail}
              alt={p.title}
              fill
              sizes="(min-width: 768px) 440px, 100vw"
              className="object-contain p-[10%]"
            />
            <StockChip product={p} className="absolute left-4 top-4" />
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm capitalize text-[#98a2b3]">
                {label(p.category)}
                {p.brand && ` · ${p.brand}`}
              </p>
              <div className="-mr-2 -mt-2">
                <CloseButton onClick={onClose} />
              </div>
            </div>
            <h2 id="quick-view-title" className="mt-1 text-2xl font-semibold">
              {p.title}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={p.rating} />
              <span className="text-sm text-[#98a2b3]">({p.rating.toFixed(1)})</span>
            </div>
            <p className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#344054]">{usd.format(p.price)}</span>
              {p.discountPercentage >= 1 && (
                <>
                  <span className="text-[#98a2b3] line-through">
                    {usd.format(p.price / (1 - p.discountPercentage / 100))}
                  </span>
                  <span className="rounded-full bg-[#ecfdf3] px-2 py-0.5 text-xs font-semibold text-[#027a48]">
                    −{Math.round(p.discountPercentage)}%
                  </span>
                </>
              )}
            </p>
            <p className="mt-4 leading-relaxed text-[#667085]">{p.description}</p>
            <div className="mt-auto flex gap-[11px] pt-8">
              <AddToCartButton product={p} inCart={inCart} onAdd={onAdd} className="flex-1" />
              <ShortlistButton on={shortlisted} onClick={onShortlist} className="flex-1" />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export type CartLine = { product: Product; qty: number };

export function CartDrawer({
  open,
  lines,
  online,
  onQty,
  onCheckout,
  onClose,
}: {
  open: boolean;
  lines: CartLine[];
  online: boolean;
  onQty: (id: number, qty: number) => void;
  onCheckout: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Each time the drawer opens, start from the cart view again.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPhase("idle");
  }

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  const checkout = () => {
    setPhase("processing");
    // Stands in for a payment API call; the demo just empties the cart.
    timer.current = setTimeout(() => {
      onCheckout();
      setPhase("done");
    }, 1200);
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy="cart-title" className="drawer my-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[420px]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#ededed] px-6 py-4">
          <h2 id="cart-title" className="text-lg font-semibold">
            Your cart {count > 0 && <span className="text-[#98a2b3]">({count})</span>}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        {phase === "done" ? (
          <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#ecfdf3] text-2xl text-[#12b76a]">✓</span>
            <p className="text-lg font-semibold">Order placed</p>
            <p className="text-sm text-[#667085]">This is a demo, so nothing was charged.</p>
            <button onClick={onClose} className="btn-secondary mt-3 px-6">
              Continue shopping
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-[#667085]">Add a product and it will show up here.</p>
            <button onClick={onClose} className="btn-secondary mt-3 px-6">
              Browse products
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[#f2f4f7] overflow-y-auto px-6">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 rounded-lg bg-[#f7f5f7]">
                    <FadeImage src={p.thumbnail} alt="" fill sizes="64px" className="object-contain p-1" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <p className="line-clamp-1 font-medium">{p.title}</p>
                      <p className="font-semibold">{usd.format(p.price * qty)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#d0d5dd]">
                        <button
                          onClick={() => onQty(p.id, qty - 1)}
                          disabled={qty <= 1}
                          aria-label={`Remove one ${p.title}`}
                          className="stepper-btn"
                        >
                          −
                        </button>
                        <output aria-label="Quantity" className="w-8 text-center text-sm font-semibold">
                          {qty}
                        </output>
                        <button
                          onClick={() => onQty(p.id, qty + 1)}
                          disabled={qty >= p.stock}
                          aria-label={`Add one more ${p.title}`}
                          className="stepper-btn"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => onQty(p.id, 0)}
                        className="text-sm text-[#667085] underline-offset-2 hover:text-[#b42318] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#ededed] px-6 py-5">
              <p className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{usd.format(subtotal)}</span>
              </p>
              <button
                onClick={checkout}
                disabled={!online || phase === "processing"}
                aria-busy={phase === "processing"}
                className="btn-primary mt-4 flex h-11 w-full items-center justify-center gap-2"
              >
                {phase === "processing" ? (
                  <>
                    <Spinner /> Placing order…
                  </>
                ) : online ? (
                  "Checkout"
                ) : (
                  "Go online to check out"
                )}
              </button>
              {!online && (
                <p className="mt-2 text-center text-xs text-[#667085]">Your cart is saved on this device.</p>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
