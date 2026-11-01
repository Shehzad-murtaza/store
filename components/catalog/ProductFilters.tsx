import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types";
import type { ParsedCatalogFilters } from "@/lib/catalog/filters";

export function ProductFilters({
  categories,
  filters,
  action = "/products",
  showCategory = true,
}: {
  categories: Category[];
  filters: ParsedCatalogFilters;
  action?: string;
  showCategory?: boolean;
}) {
  return <form action={action} method="get" className="static block w-full overflow-visible rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={15} className="text-[#777]" />Filters</h2>
      <Link href={action} className="text-xs text-[#777] underline-offset-4 hover:text-[#111] hover:underline">Clear</Link>
    </div>
    <div className="grid gap-3">
      {showCategory && <label className="grid gap-1.5 text-xs font-medium text-[#666]">Category
        <select name="category" defaultValue={filters.category ?? ""} className="h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 text-sm font-normal text-[#111] outline-none focus:border-[#999]">
          <option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </label>}
      <fieldset className="grid gap-1.5">
        <legend className="text-xs font-medium text-[#666]">Price range · PKR</legend>
        <div className="grid grid-cols-2 gap-3"><input aria-label="Minimum price in PKR" type="number" name="minPrice" min="0" step="1" placeholder="Min" defaultValue={filters.minPriceInput} className="h-10 w-full min-w-0 rounded-lg border border-[#eaeaea] bg-white px-3 text-sm outline-none placeholder:text-[#999] focus:border-[#999]" /><input aria-label="Maximum price in PKR" type="number" name="maxPrice" min="0" step="1" placeholder="Max" defaultValue={filters.maxPriceInput} className="h-10 w-full min-w-0 rounded-lg border border-[#eaeaea] bg-white px-3 text-sm outline-none placeholder:text-[#999] focus:border-[#999]" /></div>
      </fieldset>
      <label className="grid gap-1.5 text-xs font-medium text-[#666]">Availability
        <select name="availability" defaultValue={filters.availabilityValue} className="h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 text-sm font-normal text-[#111] outline-none focus:border-[#999]"><option value="all">All items</option><option value="in_stock">In stock</option><option value="sold">Sold</option></select>
      </label>
      <label className="grid gap-1.5 text-xs font-medium text-[#666]">Sort
        <select name="sort" defaultValue={filters.sortValue} className="h-10 w-full rounded-lg border border-[#eaeaea] bg-white px-3 text-sm font-normal text-[#111] outline-none focus:border-[#999]"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
      </label>
      <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-sm text-[#444]"><input type="checkbox" name="featured" value="true" defaultChecked={filters.featuredOnly} className="size-4 accent-[#1a1a1a]" />Featured only</label>
      <button type="submit" className="h-10 w-full rounded-lg bg-[#1a1a1a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#333]">Apply filters</button>
    </div>
  </form>;
}
