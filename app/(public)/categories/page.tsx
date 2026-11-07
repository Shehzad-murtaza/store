import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import { getCategoriesWithCounts } from "@/lib/supabase/catalog";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Categories" };

async function CategoryResults() {
  const categories = await getCategoriesWithCounts();
  return categories.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div> : <EmptyState title="No categories yet" description="Our collection is being prepared. Please check back soon." actionHref="/products" actionLabel="Browse products" />;
}

function CategoryGridSkeleton() {
  return <div aria-label="Loading categories" className="grid grid-cols-2 gap-3 animate-pulse sm:gap-5 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-2.5 shadow-sm sm:p-3"><div className="aspect-[4/3] rounded-lg bg-[#f0f0ef] sm:aspect-[5/3]" /><div className="mt-3 h-4 w-2/3 rounded bg-[#eaeaea]" /><div className="mt-2 h-3 w-1/3 rounded bg-[#f0f0f0]" /></div>)}
  </div>;
}

export default function CategoriesPage() {
  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
    <div className="mb-4"><BackButton fallbackHref="/" /></div>
    <header className="mb-6 max-w-2xl sm:mb-9">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Explore SHEZY</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Shop by category</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">Browse the collection by the things you are looking for.</p>
    </header>
    <Suspense fallback={<CategoryGridSkeleton />}><CategoryResults /></Suspense>
  </main>;
}
