import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { formatPKR } from "@/lib/catalog/format";
import { getProductBySlug, getProducts } from "@/lib/supabase/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product", description: product?.description ?? undefined };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category_id && product.category
    ? await getProducts({ categoryId: product.category_id, excludeId: product.id, limit: 4, sort: "newest" })
    : [];
  const hasDiscount = product.discount_price !== null;
  const currentPrice = hasDiscount ? product.discount_price! : product.price;

  return <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#777] sm:mb-6 sm:text-xs">
      <Link href="/products" className="hover:text-[#111]">Products</Link><span aria-hidden="true">/</span>
      {product.category && <><Link href={`/categories/${product.category.slug}`} className="hover:text-[#111]">{product.category.name}</Link><span aria-hidden="true">/</span></>}
      <span className="text-[#444]">{product.name}</span>
    </nav>

    <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductGallery images={product.product_images} productName={product.name} />
      <section className="lg:py-4">
        {product.category && <Link href={`/categories/${product.category.slug}`} className="text-xs font-medium uppercase tracking-[0.13em] text-[#777] hover:text-[#111]">{product.category.name}</Link>}
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:mt-3 sm:text-3xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-4">
          <span className="text-xl font-semibold">{formatPKR(currentPrice)}</span>
          {hasDiscount && <span className="text-sm text-[#888] line-through">{formatPKR(product.price)}</span>}
        </div>
        <div className="mt-5"><span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${product.is_sold ? "bg-[#f1f1f1] text-[#666]" : "bg-[#f0f4ef] text-[#45614a]"}`}>{product.is_sold ? "Sold" : "In Stock"}</span></div>
        {product.description && <div className="mt-7 border-t border-[#eaeaea] pt-6"><h2 className="text-sm font-semibold">Description</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#666]">{product.description}</p></div>}
        <div className="mt-6 w-full max-w-md sm:mt-8"><WhatsAppButton name={product.name} price={Number(currentPrice)} slug={product.slug} /></div>
      </section>
    </div>

    {related.length > 0 && <section className="mt-16 border-t border-[#eaeaea] pt-10 sm:mt-20">
      <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Keep exploring</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Related products</h2></div>{product.category && <Link href={`/categories/${product.category.slug}`} className="text-sm text-[#555] hover:text-black">View category</Link>}</div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
    </section>}
  </main>;
}
