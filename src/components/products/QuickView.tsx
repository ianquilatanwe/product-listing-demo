"use client";

import { useState } from "react";
import { CloseButton, Dialog } from "@/components/ui/Dialog";
import { FadeImage } from "@/components/ui/FadeImage";
import { label, usd, type Product } from "@/lib/products";
import { AddToCartButton, ShortlistButton } from "./ProductActions";
import { Stars } from "./Stars";
import { StockChip } from "./StockChip";

/** Product details in a dialog. Open while `product` is set; closes via onClose. */
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
    <Dialog
      open={!!product}
      onClose={onClose}
      labelledBy="quick-view-title"
      className="modal m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[880px] overflow-y-auto rounded-[18px]"
    >
      {p && (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-surface">
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
              <p className="text-sm capitalize text-muted">
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
              <span className="text-sm text-muted">({p.rating.toFixed(1)})</span>
            </div>
            <p className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-body">{usd.format(p.price)}</span>
              {p.discountPercentage >= 1 && (
                <>
                  <span className="text-muted line-through">{usd.format(p.price / (1 - p.discountPercentage / 100))}</span>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-strong">
                    −{Math.round(p.discountPercentage)}%
                  </span>
                </>
              )}
            </p>
            <p className="mt-4 leading-relaxed text-muted">{p.description}</p>
            <div className="mt-auto flex gap-[11px] pt-8">
              <AddToCartButton key={p.id} product={p} inCart={inCart} onAdd={onAdd} className="flex-1" />
              <ShortlistButton on={shortlisted} onClick={onShortlist} className="flex-1" />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
