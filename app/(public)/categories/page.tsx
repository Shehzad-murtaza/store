import type { Metadata } from "next";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import { getCategoriesWithCounts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="mb-9 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Explore SHEZY</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Shop by category</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">Browse the collection by the things you are looking for.</p>
    </header>
    {categories.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div> : <EmptyState title="No categories yet" description="Our collection is being prepared. Please check back soon." actionHref="/products" actionLabel="Browse products" />}
  </main>;
}
