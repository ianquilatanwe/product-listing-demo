import Image from "next/image";
import { FadeImage } from "@/components/ui/FadeImage";
import { label, usd, type Product } from "@/lib/products";
import { AddToCartButton, HeartButton, ShortlistButton } from "./ProductActions";
import { Stars } from "./Stars";
import { StockChip } from "./StockChip";

export function ProductCard({
  product: p,
  inCart,
  shortlisted,
  onAdd,
  onShortlist,
  onQuickView,
}: {
  product: Product;
  inCart: number;
  shortlisted: boolean;
  onAdd: () => void;
  onShortlist: () => void;
  onQuickView: () => void;
}) {
  return (
    <li className="group flex flex-col overflow-hidden rounded-[18.48px] border-[1.54px] border-surface bg-white motion-safe:transition motion-safe:duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(16,24,40,0.18)]">
      <div className="relative aspect-square overflow-hidden bg-surface">
        <button onClick={onQuickView} aria-label={`Quick view: ${p.title}`} className="absolute inset-0 cursor-zoom-in">
          <FadeImage
            src={p.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1280px) 305px, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-[12%] group-hover:scale-105"
          />
          {/* The design's hidden "Quick View" pill, revealed on hover or keyboard focus. */}
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-edge bg-white px-4 py-2 text-sm font-semibold text-body opacity-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] motion-safe:translate-y-2 motion-safe:transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Image src="/eye.svg" alt="" width={18} height={18} />
            Quick View
          </span>
        </button>
        <StockChip product={p} className="pointer-events-none absolute left-[15px] top-[15px]" />
        <HeartButton on={shortlisted} title={p.title} onClick={onShortlist} className="absolute right-[15px] top-[15px]" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 title={p.title} className="line-clamp-1 text-lg font-medium text-muted">
            {p.title}
          </h2>
          <p className="whitespace-nowrap text-lg font-bold text-body">{usd.format(p.price)}</p>
        </div>
        <p className="mt-1 text-sm capitalize text-muted">{p.brand ?? label(p.category)}</p>
        <div className="mt-3 flex items-center gap-2">
          <Stars rating={p.rating} />
          <span className="text-sm text-muted">({p.rating.toFixed(1)})</span>
        </div>
        <div className="mt-auto flex gap-[11px] pt-6">
          <AddToCartButton product={p} inCart={inCart} onAdd={onAdd} className="flex-1" />
          <ShortlistButton on={shortlisted} onClick={onShortlist} className="flex-1" />
        </div>
      </div>
    </li>
  );
}
