/** Placeholder with the same shape as ProductCard, shown while products load. */
export function CardSkeleton() {
  return (
    <li aria-hidden className="flex min-h-[488px] flex-col overflow-hidden rounded-[18.48px] border-[1.54px] border-surface">
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
