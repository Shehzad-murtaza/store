import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/supabase/catalog";

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
  const products = await getProducts({ ...filters, categorySlug: slug, sort: filters.sortValue });

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="mb-8 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Category</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#666]">{category.description}</p>}
    </header>
    <div className="mb-7"><ProductFilters categories={categories} filters={filters} action={`/categories/${category.slug}`} showCategory={false} /></div>
    <div className="mb-5 text-sm text-[#666]">{products.length} {products.length === 1 ? "product" : "products"}</div>
    {products.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products match these filters" description="Try changing or clearing the filters to see more from this category." actionHref={`/categories/${category.slug}`} actionLabel="Clear filters" />}
  </main>;
}
