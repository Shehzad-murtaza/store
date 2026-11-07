import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories } from "@/lib/supabase/catalog";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = {
  title: "All Products | SHEZY",
  description: "Browse the full SHEZY collection — a considered edit of pieces for everyday living.",
  alternates: { canonical: "/products" },
};

async function ProductFilterPanel() {
  const categories = await getCategories();
  return <ResponsiveProductFilters categories={categories} action="/products" />;
}

function ProductFilterSkeleton() {
  return (
    <div aria-label="Loading filters" className="h-12 w-32 animate-pulse rounded-xl border border-gray-100 bg-gray-50 lg:h-[500px] lg:w-full lg:rounded-2xl" />
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const search = await searchParams;
  const filters = parseCatalogFilters(search);

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-4"><BackButton fallbackHref="/" /></div>
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">
          The SHEZY Collection
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-4xl">
          All Products
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#666]">
          A considered edit of pieces for everyday living. Discover premium quality products designed for the modern lifestyle.
        </p>
      </header>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <Suspense fallback={<ProductFilterSkeleton />}>
          <ProductFilterPanel />
        </Suspense>
        <div className="min-w-0 w-full">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductResults filters={filters} clearHref="/products" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
