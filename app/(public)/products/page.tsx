import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories } from "@/lib/supabase/catalog";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse the full SHEZY collection — a considered edit of pieces for everyday living.",
  alternates: { canonical: "/products" },
};

async function ProductFilterPanel() {
  const categories = await getCategories();
  return <ResponsiveProductFilters categories={categories} action="/products" />;
}

function ProductFilterSkeleton() {
  return <div aria-label="Loading filters" className="h-10 w-24 animate-pulse rounded-lg border border-[#eaeaea] bg-white lg:h-[420px] lg:w-full lg:rounded-xl" />;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const search = await searchParams;
  const filters = parseCatalogFilters(search);

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
    <header className="mb-5 max-w-2xl sm:mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">The SHEZY collection</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">All products</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">A considered edit of pieces for everyday living.</p>
    </header>
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <Suspense fallback={<ProductFilterSkeleton />}><ProductFilterPanel /></Suspense>
      <div className="min-w-0 w-full"><Suspense fallback={<ProductGridSkeleton />}><ProductResults filters={filters} clearHref="/products" /></Suspense></div>
    </div>
  </main>;
}
