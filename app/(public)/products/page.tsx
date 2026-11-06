import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories } from "@/lib/supabase/catalog";

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
    <main className="mx-auto min-h-[70vh] max-w-[1280px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      
      {/* Page Header */}
      <header className="mb-10 max-w-2xl sm:mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          The SHEZY Collection
        </p>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          All Products
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-600">
          A considered edit of pieces for everyday living. Discover premium quality products designed for the modern lifestyle.
        </p>
        <div className="mt-6 h-1 w-16 bg-black rounded-full"></div>
      </header>
      
      {/* Filters & Product Grid Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        
        {/* Left Sidebar / Mobile Filter Button */}
        <Suspense fallback={<ProductFilterSkeleton />}>
          <ProductFilterPanel />
        </Suspense>
        
        {/* Product Grid Results */}
        <div className="min-w-0 w-full">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductResults filters={filters} clearHref="/products" />
          </Suspense>
        </div>
        
      </div>
    </main>
  );
}