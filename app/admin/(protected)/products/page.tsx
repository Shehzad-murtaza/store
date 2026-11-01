import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/catalog/EmptyState";
import { deleteProduct } from "@/app/admin/actions";
import { formatPKR } from "@/lib/catalog/format";
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
  const [categories, allProducts] = await Promise.all([getCategories(), getProducts({ sort: "newest" })]);
  const products = allProducts.filter((product) => {
    if (query && !`${product.name} ${product.slug}`.toLowerCase().includes(query)) return false;
    if (categoryId && product.category_id !== categoryId) return false;
    if (status === "sold" && !product.is_sold) return false;
    if (status === "in_stock" && product.is_sold) return false;
    if (featured && !product.is_featured) return false;
    return true;
  });

  return <main className="admin-content max-w-[1200px]">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue</div><h1>Products</h1><p className="!mt-1">Manage prices, availability, and product imagery.</p></div><Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]"><Plus size={15} />Add product</Link></div>
    <form action="/admin/products" method="get" className="mb-4 grid gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_200px_150px_150px_auto]">
      <label className="relative"><span className="sr-only">Search products</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input name="q" defaultValue={query} placeholder="Search by name or slug" className="admin-input pl-9" /></label>
      <label><span className="sr-only">Filter by category</span><select name="category" defaultValue={categoryId} className="admin-select"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label><span className="sr-only">Filter by stock status</span><select name="status" defaultValue={status} className="admin-select"><option value="">All statuses</option><option value="in_stock">In Stock</option><option value="sold">Sold</option></select></label>
      <label className="flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-xs text-[#555]"><input type="checkbox" name="featured" value="true" defaultChecked={featured} className="size-4 accent-[#1a1a1a]" />Featured only</label>
      <button type="submit" className="h-10 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white hover:bg-[#333]">Filter</button>
    </form>
    <div className="mb-3 text-xs text-[#777]">{products.length} {products.length === 1 ? "product" : "products"}</div>
    {products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th className="text-right">Actions</th></tr></thead><tbody>
      {products.map((product) => <tr key={product.id}>
        <td><div className="flex min-w-52 items-center gap-3"><div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0]">{product.primary_image_url ? <Image src={product.primary_image_url} alt="" fill sizes="48px" className="object-cover" /> : <div className="grid h-full place-items-center text-[9px] text-[#999]">No image</div>}</div><div className="min-w-0"><div className="max-w-64 truncate font-medium text-[#222]">{product.name}</div><code className="mt-1 block max-w-64 truncate text-[10px] text-[#888]">{product.slug}</code></div></div></td>
        <td>{product.category?.name ?? <span className="text-[#999]">Uncategorized</span>}</td>
        <td><div className="whitespace-nowrap font-medium">{formatPKR(product.discount_price ?? product.price)}</div>{product.discount_price !== null && <div className="mt-1 text-[10px] text-[#888] line-through">{formatPKR(product.price)}</div>}</td>
        <td><span className={`admin-status ${product.is_sold ? "sold" : "available"}`}>{product.is_sold ? "Sold" : "In Stock"}</span></td>
        <td>{product.is_featured ? <span className="admin-featured">Featured</span> : <span className="text-xs text-[#999]">—</span>}</td>
        <td><div className="flex justify-end gap-2"><Link href={`/admin/products/${product.id}/edit`} className="rounded-lg border border-[#eaeaea] px-3 py-2 text-xs font-medium hover:bg-[#f7f7f7]">Edit</Link><ConfirmDialog title={`Delete ${product.name}?`} description="This permanently removes the product and its image records. Stored product images will also be removed." action={deleteProduct} actionId={product.id} /></div></td>
      </tr>)}
    </tbody></table></div> : query || categoryId || status || featured ? <EmptyState title="No products match these filters" description="Try changing the search or filters to see more products." actionHref="/admin/products" actionLabel="Clear filters" /> : <div className="admin-table-wrap p-8"><EmptyState title="No products yet" description="Add your first product to start building the catalogue." actionHref="/admin/products/new" actionLabel="Add your first product" /></div>}
  </main>;
}
