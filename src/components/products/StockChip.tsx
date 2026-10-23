import type { Product } from "@/lib/products";

/** "Only N left" / "Out of stock" badge; nothing for products in good stock. */
export function StockChip({ product, className = "" }: { product: Product; className?: string }) {
  if (product.availabilityStatus === "In Stock") return null;
  const soldOut = product.stock === 0;
  return (
    <span
      className={`rounded-full px-[10px] py-1 text-xs font-semibold ${soldOut ? "bg-error-soft text-error" : "bg-warning-soft text-warning"} ${className}`}
    >
      {soldOut ? "Out of stock" : `Only ${product.stock} left`}
    </span>
  );
}
