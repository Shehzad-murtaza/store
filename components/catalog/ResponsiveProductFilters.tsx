"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/types";
import { ProductFilters } from "@/components/catalog/ProductFilters";

export function ResponsiveProductFilters({ categories, action, showCategory = true }: {
  categories: Category[];
  action: string;
  showCategory?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeCount = ["q", "minPrice", "maxPrice", "availability", "featured", "category"].filter((key) => {
    if (key === "category" && !showCategory) return false;
    const value = searchParams.get(key);
    return value !== null && value !== "" && value !== "all";
  }).length;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <>
    <div className="mb-0 lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] bg-white px-4 text-sm font-medium text-[#111] shadow-sm">
        <SlidersHorizontal size={16} />Filters
        {activeCount > 0 && <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#1a1a1a] text-[11px] font-semibold text-white">{activeCount}</span>}
      </button>
    </div>

    <aside className="hidden w-full min-w-0 lg:block">
      <div className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm">
        <ProductFilters categories={categories} action={action} showCategory={showCategory} />
      </div>
    </aside>

    {open && <div className="fixed inset-0 z-[80] bg-black/35 lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside role="dialog" aria-modal="true" aria-label="Product filters" className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col rounded-l-2xl border-l border-[#eaeaea] bg-[#fafafa] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#eaeaea] p-4">
          <h2 className="text-base font-semibold">Filters</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] bg-white"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ProductFilters categories={categories} action={action} showCategory={showCategory} />
        </div>
        <div className="border-t border-[#eaeaea] bg-white p-4">
          <button type="button" onClick={() => setOpen(false)} className="h-11 w-full rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]">View results</button>
        </div>
      </aside>
    </div>}
  </>;
}
