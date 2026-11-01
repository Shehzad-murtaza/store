import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const search = await searchParams;
  const filters = parseCatalogFilters(search);
  const categories = await getCategories();

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
    <header className="mb-5 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">The SHEZY collection</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">All products</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">A considered edit of pieces for everyday living.</p>
    </header>
    <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
      <ResponsiveProductFilters categories={categories} filters={filters} action="/products" />
      <Suspense fallback={<ProductGridSkeleton />}><ProductResults filters={filters} clearHref="/products" /></Suspense>
    </div>
  </main>;
}
