"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import type { ParsedCatalogFilters } from "@/lib/catalog/filters";
import { ProductFilters } from "@/components/catalog/ProductFilters";

export function ResponsiveProductFilters({ categories, filters, action, showCategory = true }: {
  categories: Category[];
  filters: ParsedCatalogFilters;
  action: string;
  showCategory?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="mb-4 lg:hidden"><button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] bg-white px-4 text-sm font-medium text-[#111] shadow-sm"><SlidersHorizontal size={16} />Filters</button></div>
    <aside className="hidden lg:block"><ProductFilters categories={categories} filters={filters} action={action} showCategory={showCategory} /></aside>
    {open && <div className="fixed inset-0 z-[80] bg-black/35 lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside role="dialog" aria-modal="true" aria-label="Product filters" className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-[#fafafa] p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Filters</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] bg-white"><X size={18} /></button></div>
        <ProductFilters categories={categories} filters={filters} action={action} showCategory={showCategory} />
      </aside>
    </div>}
  </>;
}
