import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ParsedCatalogFilters } from "@/lib/catalog/filters";
import { getProducts } from "@/lib/supabase/catalog";

function hasActiveFilters(filters: ParsedCatalogFilters, includeCategory: boolean) {
  return Boolean(
    (includeCategory && filters.category) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.availability ||
    filters.featuredOnly ||
    filters.sortValue !== "newest",
  );
}

export function ProductGridSkeleton() {
  return <div aria-label="Loading products" className="grid animate-pulse grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-3 shadow-sm"><div className="aspect-[4/3] rounded-lg bg-[#f0f0ef]" /><div className="mt-4 h-4 w-2/3 rounded bg-[#eaeaea]" /><div className="mt-3 h-3 w-1/3 rounded bg-[#f0f0f0]" /></div>)}
  </div>;
}

export async function ProductResults({ filters, categorySlug, clearHref, includeCategory = true }: {
  filters: ParsedCatalogFilters;
  categorySlug?: string;
  clearHref: string;
  includeCategory?: boolean;
}) {
  const products = await getProducts(categorySlug ? { ...filters, categorySlug } : filters);
  if (!products.length) {
    const filtered = hasActiveFilters(filters, includeCategory);
    return <EmptyState
      title={filtered ? "No products match these filters." : "No products yet."}
      description={filtered ? "Adjust your selections or clear the filters to browse the collection." : "New products will appear here as the collection grows."}
      actionHref={filtered ? clearHref : undefined}
      actionLabel={filtered ? "Clear" : undefined}
      actionClassName={filtered ? "mt-5 inline-flex h-9 items-center rounded-lg border border-[#eaeaea] px-4 text-sm font-medium text-[#111] transition-colors hover:bg-[#f5f5f5]" : undefined}
    />;
  }
  return <section aria-label="Product results">
    <p className="mb-4 text-[13px] text-[#666]">{products.length} {products.length === 1 ? "product" : "products"}</p>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
  </section>;
}
