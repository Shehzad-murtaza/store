import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGridSkeleton, ProductResults } from "@/components/catalog/ProductResults";
import { ResponsiveProductFilters } from "@/components/catalog/ResponsiveProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories, getCategoryBySlug } from "@/lib/supabase/catalog";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Category", description: category?.description ?? undefined };
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);
  if (!category) notFound();

  const filters = parseCatalogFilters(search);

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
    <header className="mb-5 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Category</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#666]">{category.description}</p>}
    </header>
    <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
      <ResponsiveProductFilters categories={categories} filters={filters} action={`/categories/${category.slug}`} showCategory={false} />
      <Suspense fallback={<ProductGridSkeleton />}><ProductResults filters={filters} categorySlug={slug} clearHref={`/categories/${category.slug}`} includeCategory={false} /></Suspense>
    </div>
  </main>;
}
