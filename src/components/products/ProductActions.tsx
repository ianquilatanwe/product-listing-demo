"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/lib/products";

// The buttons a shopper uses on a product, shared by the card and Quick View.

/**
 * Add To Cart with visible states: idle → adding (spinner) → added (✓) → idle.
 * The 600 ms pause stands in for a cart API call so the loading state shows;
 * disabled when sold out or when the cart already holds all the stock.
 */
export function AddToCartButton({
  product,
  inCart,
  onAdd,
  className = "",
}: {
  product: Product;
  inCart: number;
  onAdd: () => void;
  className?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "adding" | "added">("idle");

  const soldOut = product.stock === 0;
  const maxed = !soldOut && inCart >= product.stock;

  // The timers are deliberately not cancelled on unmount: a click must still
  // add the item if the card leaves the screen (page change, filter) mid-way.
  const add = () => {
    setPhase("adding");
    setTimeout(() => {
      onAdd();
      setPhase("added");
      setTimeout(() => setPhase("idle"), 1500);
    }, 600);
  };

  return (
    <button
      onClick={add}
      disabled={soldOut || maxed || phase !== "idle"}
      aria-busy={phase === "adding"}
      className={`btn-primary ${phase === "added" ? "!border-success-strong !bg-success-strong !text-white" : ""} ${className}`}
    >
      <span aria-live="polite" className="flex items-center justify-center gap-2">
        {phase === "adding" ? (
          <>
            <Spinner /> Adding…
          </>
        ) : phase === "added" ? (
          "✓ Added"
        ) : soldOut ? (
          "Out of stock"
        ) : maxed ? (
          "Max in cart"
        ) : (
          "Add To Cart"
        )}
      </span>
    </button>
  );
}

export function ShortlistButton({ on, onClick, className = "" }: { on: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`btn-secondary ${on ? "!border-danger !text-error" : ""} ${className}`}
    >
      {on ? "♥ Shortlisted" : "Add Shortlist"}
    </button>
  );
}

/** The heart on the card image; same state as ShortlistButton. */
export function HeartButton({
  on,
  title,
  onClick,
  className = "",
}: {
  on: boolean;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={`Shortlist ${title}`}
      className={`rounded-full p-[10.78px] motion-safe:transition hover:scale-110 active:scale-95 ${on ? "bg-danger-soft" : "bg-[#fcfcfd] hover:bg-white"} ${className}`}
    >
      {/* The design's heart icon used as a mask, so its colour can follow the state. */}
      <span
        aria-hidden
        key={String(on)}
        className={`block size-[24.64px] ${on ? "bg-danger motion-safe:animate-[pop_0.35s_ease-out]" : "bg-muted"}`}
        style={{ mask: "url(/heart.svg) center / contain no-repeat" }}
      />
    </button>
  );
}
