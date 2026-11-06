import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import ProductCard from "@/components/catalog/ProductCard";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
      
      {/* 1. The Modern Bento Grid Hero Section */}
      <section className="mx-auto max-w-[1280px] px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[500px]">
          
          {/* Main Large Card */}
          <div className="lg:col-span-2 relative rounded-[32px] bg-[#F6F6F4] overflow-hidden flex flex-col justify-center p-8 sm:p-12 md:p-16 shadow-sm border border-gray-100">
            <span className="inline-block py-1.5 px-4 rounded-full bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 self-start">
              SHEZY Exclusive
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-[1.05]">
              Good things,<br />chosen well.
            </h1>
            <p className="text-gray-600 mb-10 max-w-md text-base sm:text-lg font-medium">
              A considered edit of pieces for everyday living. Elevate your lifestyle with our premium collection.
            </p>
            <div className="flex flex-wrap gap-4 mt-auto">
              <Link href="/products" className="bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1">
                Explore Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <Suspense fallback={<HomePromosFallback />}><HomePromos /></Suspense>

        </div>
      </section>

      {/* 2. Trust Badges / Value Propositions */}
      <section className="py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-7 border-y border-gray-100 py-8 text-center sm:py-9 md:grid-cols-3 md:gap-6">
            <div className="flex flex-col items-center">
              <Truck className="mb-3 h-6 w-6 text-black" strokeWidth={1.6} />
              <h3 className="mb-1.5 text-sm font-semibold text-gray-900">Fast Delivery</h3>
              <p className="text-[13px] text-gray-500">Swift and reliable shipping nationwide.</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="mb-3 h-6 w-6 text-black" strokeWidth={1.6} />
              <h3 className="mb-1.5 text-sm font-semibold text-gray-900">Secure Payments</h3>
              <p className="text-[13px] text-gray-500">100% safe &amp; encrypted checkout process.</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="mb-3 h-6 w-6 text-black" strokeWidth={1.6} />
              <h3 className="mb-1.5 text-sm font-semibold text-gray-900">Premium Support</h3>
              <p className="text-[13px] text-gray-500">We&apos;re always here to help you out.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <Suspense fallback={<FeaturedProductsFallback />}><FeaturedProductsSection /></Suspense>
      
      {/* 4. Categories */}
      <Suspense fallback={<CategoriesFallback />}><CategoriesSection /></Suspense>
      
    </main>
  );
}

async function HomePromos() {
  const [newestProducts, categories] = await Promise.all([
    getProducts({ sort: "newest", limit: 1 }),
    getCategoriesWithCounts(),
  ]);
  const newestProduct = newestProducts[0];
  const category = categories.find((item) => item.product_count > 0);

  return <div className="flex flex-col gap-4 sm:gap-6">
    <Link href="/products" className="group relative flex min-h-[220px] flex-1 items-end overflow-hidden rounded-[28px] bg-[#17191f] p-6 shadow-sm sm:min-h-[240px] sm:rounded-[32px] sm:p-8">
      {newestProduct?.primary_image_url && <Image src={newestProduct.primary_image_url} alt="" fill priority sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]" />}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
      <span className="relative z-10">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Just dropped</span>
        <span className="block text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">New arrivals</span>
      </span>
    </Link>

    <Link href={category ? `/categories/${category.slug}` : "/categories"} className={`group relative flex min-h-[220px] flex-1 items-end overflow-hidden rounded-[28px] p-6 shadow-sm transition-colors sm:min-h-[240px] sm:rounded-[32px] sm:p-8 ${category?.image_url ? "bg-[#17191f]" : "border border-[#eaeaea] bg-[#f3f3f1] hover:border-[#d7d7d7]"}`}>
      {category?.image_url && <Image src={category.image_url} alt="" fill priority sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover opacity-65 transition-transform duration-700 group-hover:scale-[1.03]" />}
      {category?.image_url && <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />}
      <span className="relative z-10">
        <span className={`mb-2 block text-xs font-semibold uppercase tracking-[0.14em] ${category?.image_url ? "text-white/70" : "text-[#777]"}`}>{category ? "Shop a category" : "Browse the collection"}</span>
        <span className={`block text-2xl font-semibold tracking-[-0.04em] sm:text-3xl ${category?.image_url ? "text-white" : "text-[#111]"}`}>{category?.name ?? "Categories"}</span>
      </span>
    </Link>
  </div>;
}

function HomePromosFallback() {
  return <div className="flex flex-col gap-4 sm:gap-6">
    <Link href="/products" className="flex min-h-[220px] flex-1 items-end rounded-[28px] bg-[#17191f] p-6 shadow-sm sm:min-h-[240px] sm:rounded-[32px] sm:p-8"><span><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Just dropped</span><span className="block text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">New arrivals</span></span></Link>
    <Link href="/categories" className="flex min-h-[220px] flex-1 items-end rounded-[28px] border border-[#eaeaea] bg-[#f3f3f1] p-6 shadow-sm sm:min-h-[240px] sm:rounded-[32px] sm:p-8"><span><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Browse the collection</span><span className="block text-2xl font-semibold tracking-[-0.04em] text-[#111] sm:text-3xl">Categories</span></span></Link>
  </div>;
}

function FeaturedSectionHeading() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 text-center sm:mb-7 sm:flex-row sm:items-end sm:text-left">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-3xl">Featured Collection</h2>
      </div>
      <Link href="/products" className="inline-flex items-center justify-center gap-1 text-[13px] font-medium text-gray-600 transition-colors hover:text-black">
        View all products <ArrowRight size={16} />
      </Link>
    </div>
  );
}

async function FeaturedProductsSection() {
  const featured = await getProducts({ featuredOnly: true, sort: "newest", limit: 4 });
  const products = featured.length ? featured : await getProducts({ sort: "newest", limit: 4 });
  
  return (
    <section id="featured" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 bg-white">
      <FeaturedSectionHeading />
      {products.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState 
          className="home-featured-empty" 
          title="A few good things are on their way" 
          description="Featured pieces will appear here as soon as they are added to the collection." 
          actionHref="/products" 
          actionLabel="Browse all products" 
        />
      )}
    </section>
  );
}

function FeaturedProductsFallback() {
  return (
    <section id="featured" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 bg-white">
      <FeaturedSectionHeading />
      <div aria-label="Loading featured products" className="grid grid-cols-2 gap-4 animate-pulse sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="aspect-[4/5] rounded-xl bg-gray-100" />
            <div className="mt-4 space-y-2 px-1">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesHeading() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 text-center sm:mb-7 sm:flex-row sm:items-end sm:text-left">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-3xl">Shop by Category</h2>
      </div>
      <Link href="/categories" className="inline-flex items-center justify-center gap-1 text-[13px] font-medium text-gray-600 transition-colors hover:text-black">
        View all categories <ArrowRight size={16} />
      </Link>
    </div>
  );
}

async function CategoriesSection() {
  const categories = await getCategoriesWithCounts();
  const activeCategories = categories.filter((category) => category.product_count > 0);
  
  return (
    <section id="categories" className="bg-[#F6F6F4]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <CategoriesHeading />
        {activeCategories.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {activeCategories.slice(0, 6).map((category) => (
              <CategoryCard category={category} key={category.id} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Our categories are taking shape" 
            description="New collections will appear here as the catalogue grows." 
            actionHref="/categories" 
            actionLabel="View categories" 
          />
        )}
      </div>
    </section>
  );
}

function CategoriesFallback() {
  return (
    <section id="categories" className="bg-[#F6F6F4]">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <CategoriesHeading />
        <div aria-label="Loading categories" className="grid grid-cols-2 gap-4 animate-pulse sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl bg-gray-200 shadow-sm aspect-video" />
          ))}
        </div>
      </div>
    </section>
  );
}
