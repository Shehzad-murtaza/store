import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Add category · Admin" };

export default function NewCategoryPage() {
  return <main className="admin-content max-w-[900px]">
    <Link href="/admin/categories" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to categories</Link>
    <div className="mb-7 mt-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue structure</div><h1>Add category</h1><p className="!mt-1">Create a new collection for your products.</p></div>
    <section className="admin-form-card"><CategoryForm /></section>
  </main>;
}
