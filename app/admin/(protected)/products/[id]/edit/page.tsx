import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/supabase/catalog";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `Edit ${product.name} · Admin` : "Product · Admin" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();
  return <main className="admin-content admin-form-page">
    <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to products</Link>
    <div className="mb-7 mt-5"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Catalogue</div><h1>Edit product</h1><p className="!mt-1">Update product details, pricing, availability, and images.</p></div>
    <ProductForm product={product} categories={categories} images={product.product_images} />
  </main>;
}
