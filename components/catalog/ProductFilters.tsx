"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";

const fieldClass = "h-10 w-full min-w-0 rounded-lg border border-[#eaeaea] bg-white px-3 text-sm font-normal text-[#111] outline-none transition-colors focus:border-[#999]";
const labelClass = "grid gap-1.5 text-xs font-medium text-[#666]";

export function ProductFilters({
  categories,
  action = "/products",
  showCategory = true,
}: {
  categories: Category[];
  action?: string;
  showCategory?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const urlMin = searchParams.get("minPrice") ?? "";
  const urlMax = searchParams.get("maxPrice") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);

  // Keep text inputs in sync when the URL changes (chips, Clear, back/forward).
  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);
  useEffect(() => { setMinPrice(urlMin); }, [urlMin]);
  useEffect(() => { setMaxPrice(urlMax); }, [urlMax]);

  const update = useCallback((changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const queryString = params.toString();
    startTransition(() => router.replace(queryString ? `${action}?${queryString}` : action, { scroll: false }));
  }, [action, router, searchParams]);

  // Debounced text inputs.
  useEffect(() => {
    if (query === urlQuery) return;
    const id = setTimeout(() => update({ q: query.trim() || null }), 350);
    return () => clearTimeout(id);
  }, [query, urlQuery, update]);

  useEffect(() => {
    if (minPrice === urlMin) return;
    const id = setTimeout(() => update({ minPrice: minPrice.trim() || null }), 500);
    return () => clearTimeout(id);
  }, [minPrice, urlMin, update]);

  useEffect(() => {
    if (maxPrice === urlMax) return;
    const id = setTimeout(() => update({ maxPrice: maxPrice.trim() || null }), 500);
    return () => clearTimeout(id);
  }, [maxPrice, urlMax, update]);

  const categoryValue = searchParams.get("category") ?? "";
  const availabilityValue = searchParams.get("availability") ?? "all";
  const sortValue = searchParams.get("sort") ?? "newest";
  const featuredOnly = searchParams.get("featured") === "true";

  const chips = useMemo(() => {
    const list: Array<{ key: string; label: string; clear: Record<string, string | null> }> = [];
    if (urlQuery) list.push({ key: "q", label: `“${urlQuery}”`, clear: { q: null } });
    if (showCategory && categoryValue) {
      const match = categories.find((category) => category.slug === categoryValue);
      list.push({ key: "category", label: match?.name ?? categoryValue, clear: { category: null } });
    }
    if (urlMin || urlMax) {
      const label = urlMin && urlMax ? `PKR ${urlMin} – ${urlMax}` : urlMin ? `PKR ${urlMin} and up` : `PKR up to ${urlMax}`;
      list.push({ key: "price", label, clear: { minPrice: null, maxPrice: null } });
    }
    if (availabilityValue === "in_stock") list.push({ key: "availability", label: "In stock", clear: { availability: null } });
    if (availabilityValue === "sold") list.push({ key: "availability", label: "Sold", clear: { availability: null } });
    if (featuredOnly) list.push({ key: "featured", label: "Featured", clear: { featured: null } });
    return list;
  }, [availabilityValue, categories, categoryValue, featuredOnly, showCategory, urlMax, urlMin, urlQuery]);

  return <div className={`grid gap-4 transition-opacity duration-150${isPending ? " opacity-60" : ""}`} aria-busy={isPending}>
    <div className="flex items-center justify-between">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={15} className="text-[#777]" />Filters</h2>
      <Link href={action} className="text-xs text-[#777] underline-offset-4 hover:text-[#111] hover:underline">Clear</Link>
    </div>

    {chips.length > 0 && <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => <button key={chip.key} type="button" onClick={() => update(chip.clear)} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#f5f5f5] pl-2.5 pr-1.5 text-xs text-[#444] transition-colors hover:bg-[#f0f0f0]">
        {chip.label}<X size={13} className="text-[#888]" />
      </button>)}
    </div>}

    <div className="grid gap-3">
      <label className="relative block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input type="search" aria-label="Search products" placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} className={`${fieldClass} pl-9`} />
      </label>

      {showCategory && <label className={labelClass}>Category
        <select value={categoryValue} onChange={(event) => update({ category: event.target.value || null })} className={fieldClass}>
          <option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </label>}

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-[#666]">Price range · PKR</legend>
        <div className="grid grid-cols-2 gap-3">
          <input aria-label="Minimum price in PKR" type="number" min="0" step="1" placeholder="Min" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className={fieldClass} />
          <input aria-label="Maximum price in PKR" type="number" min="0" step="1" placeholder="Max" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={fieldClass} />
        </div>
      </fieldset>

      <label className={labelClass}>Availability
        <select value={availabilityValue} onChange={(event) => update({ availability: event.target.value === "all" ? null : event.target.value })} className={fieldClass}>
          <option value="all">All items</option><option value="in_stock">In stock</option><option value="sold">Sold</option>
        </select>
      </label>

      <label className={labelClass}>Sort
        <select value={sortValue} onChange={(event) => update({ sort: event.target.value === "newest" ? null : event.target.value })} className={fieldClass}>
          <option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
        </select>
      </label>

      <label className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-sm text-[#444]">
        <input type="checkbox" checked={featuredOnly} onChange={(event) => update({ featured: event.target.checked ? "true" : null })} className="size-4 accent-[#1a1a1a]" />Featured only
      </label>
    </div>
  </div>;
}
