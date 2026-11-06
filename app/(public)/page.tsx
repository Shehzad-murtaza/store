import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { formatPKR } from "@/lib/catalog/format";
import { getCategoriesWithCounts, getProducts } from "@/lib/supabase/catalog";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }} />
      <section id="home-hero" className="home-hero relative isolate m-0 h-[100svh] overflow-hidden bg-[#F6F6F4] px-4 text-[#111111] sm:px-6">
        <div aria-hidden="true" className="home-hero-glow pointer-events-none absolute left-1/2 top-1/2" />
        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1280px] content-center items-center gap-7 pb-6 pt-[68px] md:grid-cols-[0.9fr_1.1fr] md:gap-12 lg:gap-20">
          <div className="home-hero-content min-w-0 text-center md:text-left">
            <p className="home-hero-muted text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">SHEZY</p>
            <h1 className="home-hero-heading mx-auto mt-3 max-w-[15ch] text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.055em] sm:mt-4 sm:text-5xl md:mx-0 md:text-[3.25rem] lg:text-6xl">Good things, chosen well.</h1>
            <p className="home-hero-muted mx-auto mt-3 max-w-sm text-sm leading-6 sm:mt-4 sm:text-base md:mx-0">A small edit of pieces for everyday use.</p>
            <div className="mt-5 sm:mt-7"><Link href="/products" className="home-hero-explore inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-transform hover:-translate-y-0.5">Explore <ArrowRight size={15} /></Link></div>
          </div>
          <Suspense fallback={<HeroProductFallback />}><HeroProductVisual /></Suspense>
        </div>
      </section>
      <Suspense fallback={<FeaturedProductsFallback />}><FeaturedProductsSection /></Suspense>
      <Suspense fallback={<CategoriesFallback />}><CategoriesSection /></Suspense>
    </main>
  );
}

async function HeroProductVisual() {
  const [product] = await getProducts({ sort: "newest", limit: 1 });

  if (!product) return <HeroProductFallback />;

  const price = product.discount_price ?? product.price;

  return <article className="home-hero-product-card mx-auto w-full max-w-[520px] overflow-hidden rounded-[22px] border shadow-[0_16px_50px_rgba(17,17,17,0.08)] md:ml-auto md:mr-0 md:rounded-[28px]">
    <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="group block">
      <div className="home-hero-product-image relative aspect-[1.38] overflow-hidden sm:aspect-[1.45] md:aspect-[1.24]">
        {product.primary_image_url ? <Image src={product.primary_image_url} alt={product.name} fill priority sizes="(max-width: 767px) 92vw, (max-width: 1280px) 48vw, 560px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.025] sm:p-6 md:p-8" /> : <div className="flex h-full items-center justify-center text-[#999]"><ImageIcon size={32} strokeWidth={1.3} /></div>}
      </div>
      <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="min-w-0"><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#888]">A SHEZY find</p><p className="truncate text-sm font-medium tracking-[-0.01em] sm:text-base">{product.name}</p><p className="mt-1 text-xs text-[#777]">{formatPKR(price)}</p></div>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] text-[#333] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </div>
    </Link>
  </article>;
}

function HeroProductFallback() {
  return <div aria-hidden="true" className="home-hero-product-card mx-auto w-full max-w-[520px] overflow-hidden rounded-[22px] border shadow-sm md:ml-auto md:mr-0 md:rounded-[28px]">
    <div className="home-hero-product-image aspect-[1.38] animate-pulse sm:aspect-[1.45] md:aspect-[1.24]" />
    <div className="space-y-2 px-4 py-4 sm:px-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[#eaeaea]" /><div className="h-3 w-1/4 animate-pulse rounded bg-[#f0f0ef]" /></div>
  </div>;
}

function FeaturedSectionHeading() {
  return <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6 sm:gap-5">
    <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777] sm:text-xs">The SHEZY edit</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-3xl">From the collection</h2></div>
    <Link href="/products" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#444] hover:text-black sm:text-sm">All products <ArrowRight size={15} /></Link>
  </div>;
}

async function FeaturedProductsSection() {
  const featured = await getProducts({ featuredOnly: true, sort: "newest", limit: 4 });
  const products = featured.length ? featured : await getProducts({ sort: "newest", limit: 4 });
  return <section id="featured" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
    <FeaturedSectionHeading />
    {products.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <EmptyState className="home-featured-empty" title="A few good things are on their way" description="Featured pieces will appear here as soon as they are added to the collection." actionHref="/products" actionLabel="Browse all products" />}
  </section>;
}

function FeaturedProductsFallback() {
  return <section id="featured" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
    <FeaturedSectionHeading />
    <div aria-label="Loading featured products" className="grid grid-cols-2 gap-3 animate-pulse sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-2.5 shadow-sm sm:p-3"><div className="aspect-square rounded-lg bg-[#f0f0ef] sm:aspect-[4/3]" /><div className="mt-3 h-4 w-2/3 rounded bg-[#eaeaea]" /><div className="mt-2 h-3 w-1/3 rounded bg-[#f0f0f0]" /></div>)}
    </div>
  </section>;
}

function CategoriesHeading() {
  return <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7 sm:gap-5">
    <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777] sm:text-xs">Browse the collection</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-3xl">Categories</h2></div>
    <Link href="/categories" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#444] hover:text-black sm:text-sm">All categories <ArrowRight size={15} /></Link>
  </div>;
}

async function CategoriesSection() {
  const categories = await getCategoriesWithCounts();
  const activeCategories = categories.filter((category) => category.product_count > 0);
  return <section id="categories" className="scroll-mt-24 border-y border-[#eaeaea] bg-white">
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <CategoriesHeading />
      {activeCategories.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{activeCategories.slice(0, 6).map((category) => <CategoryCard category={category} key={category.id} />)}</div> : <EmptyState title="Our categories are taking shape" description="New collections will appear here as the catalogue grows." actionHref="/categories" actionLabel="View categories" />}
    </div>
  </section>;
}

function CategoriesFallback() {
  return <section id="categories" className="scroll-mt-24 border-y border-[#eaeaea] bg-white">
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <CategoriesHeading />
      <div aria-label="Loading categories" className="grid grid-cols-2 gap-3 animate-pulse sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-2.5 shadow-sm sm:p-3"><div className="aspect-[4/3] rounded-lg bg-[#f0f0ef] sm:aspect-[5/3]" /><div className="mt-3 h-4 w-2/3 rounded bg-[#eaeaea]" /><div className="mt-2 h-3 w-1/3 rounded bg-[#f0f0f0]" /></div>)}
      </div>
    </div>
  </section>;
}
