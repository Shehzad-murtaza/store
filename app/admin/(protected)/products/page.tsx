import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/catalog/EmptyState";
import { deleteProduct } from "@/app/admin/actions";
import { formatPKR } from "@/lib/catalog/format";
import { isOutOfStock } from "@/lib/catalog/orders";
import { getCategories, getProducts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Products · Admin" };

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = await searchParams;
  const query = first(search.q).trim().toLowerCase();
  const categoryId = first(search.category);
  const status = first(search.status);
  const featured = first(search.featured) === "true";
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      sort: "newest",
      categoryId: categoryId || undefined,
      availability: status === "sold" || status === "in_stock" ? status : undefined,
      featuredOnly: featured,
      searchTerm: query || undefined,
    }),
  ]);

  return <main className="admin-content admin-products-page">
    <header className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue</div>
      <div className="flex items-center justify-between gap-4"><h1 className="!my-0">Products</h1><Link href="/admin/products/new" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#333]"><Plus size={15} />Add product</Link></div>
      <p className="!mt-2 text-sm text-[#666]">Manage prices, availability, and product imagery.</p>
    </header>
    <div className="admin-products-toolbar-container mb-4">
    <div className="admin-products-toolbar flex items-center gap-3">
      <form action="/admin/products" method="get" className="admin-products-filter-form flex min-w-0 flex-1 items-center gap-3">
        <label className="admin-products-search relative"><span className="sr-only">Search products</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input name="q" defaultValue={query} placeholder="Search by name or slug" className="admin-input admin-search-input h-10 min-w-[220px] max-w-sm" /></label>
        <label className="shrink-0"><span className="sr-only">Filter by category</span><select name="category" defaultValue={categoryId} className="admin-select h-10 w-[180px]"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="shrink-0"><span className="sr-only">Filter by stock status</span><select name="status" defaultValue={status} className="admin-select h-10 w-[180px]"><option value="">All statuses</option><option value="in_stock">In Stock</option><option value="sold">Sold</option></select></label>
        <label className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-xs text-[#555]"><input type="checkbox" name="featured" value="true" defaultChecked={featured} className="size-4 accent-[#1a1a1a]" />Featured only</label>
        <button type="submit" className="h-10 shrink-0 rounded-lg bg-[#1a1a1a] px-3 text-xs font-medium text-white transition-colors hover:bg-[#333]">Filter</button>
      </form>
      {products.length > 0 && <span className="shrink-0 whitespace-nowrap text-sm text-neutral-500">{products.length} {products.length === 1 ? "product" : "products"}</span>}
    </div>
    </div>
    {products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Featured</th><th className="text-right">Actions</th></tr></thead><tbody>
      {products.map((product) => <tr key={product.id}>
        <td><div className="flex min-w-52 items-center gap-3"><div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0]">{product.primary_image_url ? <Image src={product.primary_image_url} alt="" fill sizes="48px" className="object-cover" /> : <div className="grid h-full place-items-center text-[9px] text-[#999]">No image</div>}</div><div className="min-w-0"><div className="max-w-64 truncate font-medium text-[#222]">{product.name}</div><code className="mt-1 block max-w-64 truncate text-[10px] text-[#888]">{product.slug}</code></div></div></td>
        <td>{product.category?.name ?? <span className="text-[#999]">Uncategorized</span>}</td>
        <td><div className="whitespace-nowrap font-medium">{formatPKR(product.discount_price ?? product.price)}</div>{product.discount_price !== null && <div className="mt-1 text-[10px] text-[#888] line-through">{formatPKR(product.price)}</div>}</td>
        <td className="whitespace-nowrap">{product.stock_quantity}</td>
        <td><span className={`admin-status ${isOutOfStock(product) ? "sold" : "available"}`}>{isOutOfStock(product) ? "Sold out" : "In stock"}</span></td>
        <td>{product.is_featured ? <span className="admin-featured">Featured</span> : <span className="text-xs text-[#999]">—</span>}</td>
        <td><div className="flex justify-end gap-2"><Link href={`/admin/products/${product.id}/edit`} className="rounded-lg border border-[#eaeaea] px-3 py-2 text-xs font-medium hover:bg-[#f7f7f7]">Edit</Link><ConfirmDialog title={`Delete ${product.name}?`} description="This permanently removes the product and its image records. Stored product images will also be removed." action={deleteProduct} actionId={product.id} /></div></td>
      </tr>)}
    </tbody></table></div> : query || categoryId || status || featured ? <EmptyState title="No products match these filters" description="Try changing the search or filters to see more products." actionHref="/admin/products" actionLabel="Clear filters" /> : <EmptyState title="No products yet" description="Add your first product to start building the catalogue." actionHref="/admin/products/new" actionLabel="Add your first product" />}
  </main>;
}
