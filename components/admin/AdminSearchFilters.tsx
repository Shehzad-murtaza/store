"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface AdminFilterSelect {
  name: string;
  ariaLabel: string;
  options: Array<{ value: string; label: string }>;
  widthClass?: string;
}

/** Live admin filter bar: typing or changing a control updates the URL instantly. */
export function AdminSearchFilters({
  searchPlaceholder,
  searchAriaLabel = "Search",
  selects = [],
  checkbox,
}: {
  searchPlaceholder: string;
  searchAriaLabel?: string;
  selects?: AdminFilterSelect[];
  checkbox?: { name: string; label: string; value: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);

  const update = useCallback((changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    const queryString = params.toString();
    startTransition(() => router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false }));
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (query === urlQuery) return;
    const id = setTimeout(() => update({ q: query.trim() || null }), 400);
    return () => clearTimeout(id);
  }, [query, urlQuery, update]);

  const hasFilters = searchParams.toString().length > 0;

  return <div className={`admin-search-filters flex min-w-0 flex-1 flex-wrap items-center gap-3 transition-opacity duration-150${isPending ? " opacity-60" : ""}`} aria-busy={isPending}>
    <label className="relative min-w-[220px] flex-1"><span className="sr-only">{searchAriaLabel}</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="admin-input admin-search-input h-10" /></label>
    {selects.map((select) => <label key={select.name} className="shrink-0"><span className="sr-only">{select.ariaLabel}</span><select value={searchParams.get(select.name) ?? ""} onChange={(event) => update({ [select.name]: event.target.value || null })} className={`admin-select h-10 ${select.widthClass ?? "w-[170px]"}`}>{select.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
    {checkbox && <label className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-xs text-[#555]"><input type="checkbox" checked={searchParams.get(checkbox.name) === checkbox.value} onChange={(event) => update({ [checkbox.name]: event.target.checked ? checkbox.value : null })} className="size-4 accent-[#1a1a1a]" />{checkbox.label}</label>}
    {hasFilters && <button type="button" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#eaeaea] px-3 text-xs font-medium text-[#555] transition-colors hover:bg-[#f7f7f7]"><X size={14} />Clear</button>}
  </div>;
}
