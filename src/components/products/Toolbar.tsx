import { Select } from "@/components/ui/Select";
import { SORTS, type SortKey, type View } from "@/lib/catalog";
import { label } from "@/lib/products";

/** Search, category, shortlist filter and sort, all driven by the View. */
export function Toolbar({
  view,
  categories,
  shortlistCount,
  onChange,
}: {
  view: View;
  categories: string[];
  shortlistCount: number;
  onChange: (patch: Partial<View>, options?: { push?: boolean }) => void;
}) {
  // A category from the URL that isn't listed (yet, or at all) still gets an
  // option, so the pill shows the filter that's actually applied.
  const shown = view.category && !categories.includes(view.category) ? [...categories, view.category] : categories;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-[11px]">
        <label className="pill bg-pill hover:bg-pill-hover">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={view.q}
            onChange={(e) => onChange({ q: e.target.value }, { push: false })}
            placeholder="Search products"
            className="w-40 bg-transparent placeholder:text-subtle focus:outline-none"
          />
        </label>
        <Select
          label="Category"
          value={view.category}
          onChange={(category) => onChange({ category })}
          className="bg-pill hover:bg-pill-hover"
          options={[["", "All categories"], ...shown.map((c) => [c, label(c)] as const)]}
        />
        <button
          onClick={() => onChange({ shortlist: !view.shortlist })}
          aria-pressed={view.shortlist}
          className={`pill motion-safe:transition ${view.shortlist ? "bg-brand text-white" : "bg-pill hover:bg-pill-hover"}`}
        >
          ♥ Shortlist{shortlistCount > 0 && ` (${shortlistCount})`}
        </button>
      </div>
      <Select
        label="Sort by"
        value={view.sort}
        onChange={(sort) => onChange({ sort: sort as SortKey })}
        className="border border-[#e0e0e0] bg-white hover:border-[#c4c9d1]"
        options={Object.entries(SORTS).map(([k, s]) => [k, s.label] as const)}
      />
    </div>
  );
}
