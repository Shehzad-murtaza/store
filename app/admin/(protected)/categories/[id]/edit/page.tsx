import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/supabase/catalog";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryById(id);
  return { title: category ? `Edit ${category.name} · Admin` : "Category · Admin" };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return <main className="admin-content admin-form-page">
    <Link href="/admin/categories" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to categories</Link>
    <div className="mb-7 mt-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue structure</div><h1>Edit category</h1><p className="!mt-1">Update the details shown across your storefront.</p></div>
    <section className="admin-form-card"><CategoryForm category={category} /></section>
  </main>;
}
