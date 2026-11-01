import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/catalog/EmptyState";
import { deleteCategory } from "@/app/admin/actions";
import { getCategoriesWithCounts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const search = await searchParams;
  const searchValue = Array.isArray(search.q) ? search.q[0] ?? "" : search.q ?? "";
  const term = searchValue.trim().toLowerCase();
  const allCategories = await getCategoriesWithCounts();
  const categories = term ? allCategories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(term)) : allCategories;

  return <main className="admin-content max-w-[1100px]">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue structure</div><h1>Categories</h1><p className="!mt-1">Organize products into clear, easy-to-browse collections.</p></div><Link href="/admin/categories/new" className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]"><Plus size={15} />Add category</Link></div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><form action="/admin/categories" method="get" className="relative w-full max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input name="q" defaultValue={searchValue} placeholder="Search categories" className="admin-input pl-9" /></form><span className="text-xs text-[#777]">{categories.length} {categories.length === 1 ? "category" : "categories"}</span></div>
    {categories.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Slug</th><th>Products</th><th className="text-right">Actions</th></tr></thead><tbody>
      {categories.map((category) => <tr key={category.id}>
        <td><div className="flex min-w-48 items-center gap-3"><div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0]">{category.image_url ? <Image src={category.image_url} alt="" fill sizes="44px" className="object-cover" /> : <div className="grid h-full place-items-center text-[9px] text-[#999]">—</div>}</div><div className="min-w-0"><div className="truncate font-medium text-[#222]">{category.name}</div>{category.description && <div className="mt-1 max-w-72 truncate text-xs text-[#777]">{category.description}</div>}</div></div></td>
        <td><code className="text-xs text-[#666]">{category.slug}</code></td>
        <td>{category.product_count}</td>
        <td><div className="flex justify-end gap-2"><Link href={`/admin/categories/${category.id}/edit`} className="rounded-lg border border-[#eaeaea] px-3 py-2 text-xs font-medium hover:bg-[#f7f7f7]">Edit</Link><ConfirmDialog title={`Delete ${category.name}?`} description="Products in this category will remain in the catalogue without a category. This action cannot be undone." action={deleteCategory} actionId={category.id} /></div></td>
      </tr>)}
    </tbody></table></div> : term ? <EmptyState title="No matching categories" description="Try another search or clear the search field." actionHref="/admin/categories" actionLabel="Clear search" /> : <div className="admin-table-wrap"><div className="p-8"><EmptyState title="No categories yet" description="Create a category to organize products in your storefront." actionHref="/admin/categories/new" actionLabel="Add your first category" /></div></div>}
  </main>;
}
