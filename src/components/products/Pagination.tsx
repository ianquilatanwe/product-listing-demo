/** Previous / up to 7 page numbers centred on the current page / Next. Hidden for one page. */
export function Pagination({ page, count, onChange }: { page: number; count: number; onChange: (page: number) => void }) {
  if (count < 2) return null;
  const start = Math.min(Math.max(1, page - 3), Math.max(1, count - 6));
  const pages = Array.from({ length: Math.min(7, count) }, (_, i) => start + i);
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-2 text-sm text-muted sm:mt-[74px]">
      <button className="page-btn px-[10px]" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`page-btn w-10 font-semibold ${p === page ? "gradient-lilac border-transparent text-ink" : ""}`}
        >
          {p}
        </button>
      ))}
      <button className="page-btn px-[10px] font-medium" disabled={page === count} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
