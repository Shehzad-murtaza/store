import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteCategory } from "@/app/admin/actions";
import { getCategoriesWithCounts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = await searchParams;
  const searchValue = Array.isArray(search.q) ? search.q[0] ?? "" : search.q ?? "";
  const term = searchValue.trim().toLowerCase();
  const allCategories = await getCategoriesWithCounts();
  const categories = term ? allCategories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(term)) : allCategories;

  return <main className="admin-content admin-categories-page">
    <header className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue structure</div>
      <div className="flex items-center justify-between gap-4"><h1 className="!my-0">Categories</h1><Link href="/admin/categories/new" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#333]"><Plus size={15} />Add category</Link></div>
      <p className="!mt-2">Organize products into clear, easy-to-browse collections.</p>
    </header>
    <div className="mb-4 flex items-center justify-between gap-4"><form action="/admin/categories" method="get" className="relative w-full max-w-[360px]"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input name="q" defaultValue={searchValue} placeholder="Search categories" className="admin-input h-10 pl-9" /></form><span className="shrink-0 text-[13px] text-[#777]">{categories.length} {categories.length === 1 ? "category" : "categories"}</span></div>
    {categories.length ? <div className="admin-table-wrap"><table className="admin-table admin-categories-table"><thead><tr><th>Category</th><th>Slug</th><th>Products</th><th className="text-right">Actions</th></tr></thead><tbody>
      {categories.map((category) => <tr key={category.id}>
        <td><div className="flex min-w-40 items-center gap-3"><div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-[#eaeaea] bg-[#f2f2f0]">{category.image_url ? <Image src={category.image_url} alt="" fill sizes="40px" className="object-cover" /> : null}</div><div className="truncate font-medium text-[#222]">{category.name}</div></div></td>
        <td><code className="text-xs text-[#666]">{category.slug}</code></td>
        <td>{category.product_count}</td>
        <td><div className="flex justify-end gap-2"><Link href={`/admin/categories/${category.id}/edit`} className="inline-flex h-9 items-center rounded-lg border border-[#eaeaea] px-3 text-xs font-medium transition-colors hover:bg-[#f7f7f7]">Edit</Link><ConfirmDialog title={`Delete ${category.name}?`} description="Products in this category will remain in the catalogue without a category. This action cannot be undone." action={deleteCategory} actionId={category.id} ghost buttonClassName="h-9 px-3 py-0 text-xs font-medium" /></div></td>
      </tr>)}
    </tbody></table></div> : <div className="admin-table-wrap px-6 py-10 text-center"><h2 className="text-sm font-semibold">{term ? "No matching categories" : "No categories yet"}</h2><p className="mt-2 text-sm text-[#666]">{term ? "Try another search or clear the search field." : "Create a category to organize products in your storefront."}</p><Link href={term ? "/admin/categories" : "/admin/categories/new"} className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white hover:bg-[#333]">{term ? "Clear search" : "Add your first category"}</Link></div>}
  </main>;
}
