"use client";

import { useEffect, useRef, useState } from "react";
import { CloseButton, Dialog } from "@/components/ui/Dialog";
import { FadeImage } from "@/components/ui/FadeImage";
import { Spinner } from "@/components/ui/Spinner";
import type { CartLine } from "@/hooks/useCart";
import { usd } from "@/lib/products";

const UNDO_MS = 6000;
const CHECKOUT_MS = 1200;

/**
 * Side drawer listing the cart: quantity steppers, Remove with Undo, subtotal
 * and a demo checkout (disabled offline). Each open starts on the cart view.
 */
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
  // The last removed line, kept for a few seconds so Remove can be undone.
  const [removed, setRemoved] = useState<CartLine | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(undoTimer.current);
    },
    [],
  );

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhase("idle");
      setRemoved(null);
    }
  }

  const remove = (line: CartLine) => {
    onQty(line.product.id, 0);
    setRemoved(line);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemoved(null), UNDO_MS);
  };
  const undo = () => {
    if (removed) onQty(removed.product.id, removed.qty);
    clearTimeout(undoTimer.current);
    setRemoved(null);
  };

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  const checkout = () => {
    setPhase("processing");
    // Stands in for a payment API call; the demo just empties the cart.
    timer.current = setTimeout(() => {
      onCheckout();
      setPhase("done");
    }, CHECKOUT_MS);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="cart-title"
      className="drawer my-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[420px]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="cart-title" className="text-lg font-semibold">
            Your cart {count > 0 && <span className="text-muted">({count})</span>}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div role="status" className="mx-6 mt-4 empty:hidden">
          {removed && phase !== "done" && (
            <div className="flex items-center justify-between gap-4 rounded-lg bg-ink px-4 py-3 text-sm text-white">
              <span className="line-clamp-1">Removed {removed.product.title}</span>
              <button onClick={undo} className="shrink-0 font-semibold underline underline-offset-2 hover:text-[#dfe3f3]">
                Undo
              </button>
            </div>
          )}
        </div>

        {phase === "done" ? (
          <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success-soft text-2xl text-success-strong">✓</span>
            <p className="text-lg font-semibold">Order placed</p>
            <p className="text-sm text-muted">This is a demo, so nothing was charged.</p>
            <button onClick={onClose} className="btn-secondary mt-3 px-6">
              Continue shopping
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted">Add a product and it will show up here.</p>
            <button onClick={onClose} className="btn-secondary mt-3 px-6">
              Browse products
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-fill overflow-y-auto px-6">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 rounded-lg bg-surface">
                    <FadeImage src={p.thumbnail} alt="" fill sizes="64px" className="object-contain p-1" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <p className="line-clamp-1 font-medium">{p.title}</p>
                      <p className="font-semibold">{usd.format(p.price * qty)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-edge">
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
                        onClick={() => remove({ product: p, qty })}
                        className="text-sm text-muted underline-offset-2 hover:text-error hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
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
              {!online && <p className="mt-2 text-center text-xs text-muted">Your cart is saved on this device.</p>}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
