"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { label, usd, type Product } from "@/lib/products";

type CardProps = {
  product: Product;
  inCart: number;
  shortlisted: boolean;
  onAdd: () => void;
  onShortlist: () => void;
  onQuickView: () => void;
};

/**
 * Image that fades in once loaded. If it fails (e.g. offline and never viewed),
 * it stays invisible so the grey backdrop shows instead of a broken-image icon.
 */
export function FadeImage({ alt, className = "", ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`motion-safe:transition motion-safe:duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}

export function ProductCard({ product: p, inCart, shortlisted, onAdd, onShortlist, onQuickView }: CardProps) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-[18.48px] border-[1.54px] border-[#f7f5f7] bg-white motion-safe:transition motion-safe:duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(16,24,40,0.18)]">
      <div className="relative aspect-square overflow-hidden bg-[#f7f5f7]">
        <button onClick={onQuickView} aria-label={`Quick view: ${p.title}`} className="absolute inset-0 cursor-zoom-in">
          <FadeImage
            src={p.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1280px) 305px, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-[12%] group-hover:scale-105"
          />
          {/* The design's hidden "Quick View" pill, revealed on hover or keyboard focus. */}
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-semibold text-[#344054] opacity-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] motion-safe:translate-y-2 motion-safe:transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Image src="/eye.svg" alt="" width={18} height={18} />
            Quick View
          </span>
        </button>
        <StockChip product={p} className="pointer-events-none absolute left-[15px] top-[15px]" />
        <HeartButton on={shortlisted} title={p.title} onClick={onShortlist} className="absolute right-[15px] top-[15px]" />
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
          <AddToCartButton product={p} inCart={inCart} onAdd={onAdd} className="flex-1" />
          <ShortlistButton on={shortlisted} onClick={onShortlist} className="flex-1" />
        </div>
      </div>
    </li>
  );
}

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
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const soldOut = product.stock === 0;
  const maxed = !soldOut && inCart >= product.stock;

  const add = () => {
    setPhase("adding");
    timer.current = setTimeout(() => {
      onAdd();
      setPhase("added");
      timer.current = setTimeout(() => setPhase("idle"), 1500);
    }, 600);
  };

  return (
    <button
      onClick={add}
      disabled={soldOut || maxed || phase !== "idle"}
      aria-busy={phase === "adding"}
      className={`btn-primary ${phase === "added" ? "!border-[#12b76a] !bg-[#12b76a] !text-white" : ""} ${className}`}
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
      className={`btn-secondary ${on ? "!border-[#d75951] !text-[#d75951]" : ""} ${className}`}
    >
      {on ? "♥ Shortlisted" : "Add Shortlist"}
    </button>
  );
}

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
      className={`rounded-full p-[10.78px] motion-safe:transition hover:scale-110 active:scale-95 ${on ? "bg-[#fde4e2]" : "bg-[#fcfcfd] hover:bg-white"} ${className}`}
    >
      {/* The design's heart icon used as a mask, so its colour can follow the state. */}
      <span
        aria-hidden
        key={String(on)}
        className={`block size-[24.64px] ${on ? "bg-[#d75951] motion-safe:animate-[pop_0.35s_ease-out]" : "bg-[#667085]"}`}
        style={{ mask: "url(/heart.svg) center / contain no-repeat" }}
      />
    </button>
  );
}

export function StockChip({ product, className = "" }: { product: Product; className?: string }) {
  if (product.availabilityStatus === "In Stock") return null;
  const soldOut = product.stock === 0;
  return (
    <span
      className={`rounded-full px-[10px] py-1 text-xs font-semibold ${soldOut ? "bg-[#fee4e2] text-[#b42318]" : "bg-[#fef0c7] text-[#b54708]"} ${className}`}
    >
      {soldOut ? "Out of stock" : `Only ${product.stock} left`}
    </span>
  );
}

// Gold stars clipped to the exact rating width over a faded row of the same icon.
export function Stars({ rating }: { rating: number }) {
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

export function Spinner() {
  return <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

export function CardSkeleton() {
  return (
    <li aria-hidden className="flex min-h-[488px] flex-col overflow-hidden rounded-[18.48px] border-[1.54px] border-[#f7f5f7]">
      <div className="skeleton aspect-square" />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-6 pt-6">
        <div className="flex justify-between gap-6">
          <div className="skeleton h-5 flex-1 rounded" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="mt-auto flex gap-[11px]">
          <div className="skeleton h-9 flex-1 rounded-full" />
          <div className="skeleton h-9 flex-1 rounded-full" />
        </div>
      </div>
    </li>
  );
}
