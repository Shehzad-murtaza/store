import type { Metadata } from "next";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { parseCatalogFilters, type CatalogSearchParams } from "@/lib/catalog/filters";
import { getCategories, getProducts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const search = await searchParams;
  const filters = parseCatalogFilters(search);
  const [categories, products] = await Promise.all([getCategories(), getProducts(filters)]);

  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="mb-8 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">The SHEZY collection</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">All products</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">A considered edit of pieces for everyday living.</p>
    </header>
    <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24"><ProductFilters categories={categories} filters={filters} /></aside>
      <section>
        <div className="mb-5 text-sm text-[#666]">{products.length} {products.length === 1 ? "product" : "products"}</div>
        {products.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No products found" description="There are no items for these filters just yet. Clear them to explore the full collection." actionHref="/products" actionLabel="Clear filters" />}
      </section>
    </div>
  </main>;
}
