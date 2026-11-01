import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/supabase/catalog";

export const metadata: Metadata = { title: "Add product · Admin" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return <main className="admin-content max-w-[1000px]">
    <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to products</Link>
    <div className="mb-7 mt-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue</div><h1>Add product</h1><p className="!mt-1">Add the details and images for a new item.</p></div>
    <ProductForm categories={categories} />
  </main>;
}
