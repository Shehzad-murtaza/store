import type { Metadata } from "next";
import { Suspense } from "react";
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

          {/* Side Stacked Cards */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <Link href="/categories/new-arrivals" className="relative group flex-1 rounded-[32px] bg-gray-900 overflow-hidden flex items-end p-8 shadow-sm min-h-[240px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 z-10 transition-opacity group-hover:opacity-70"></div>
              <div className="relative z-20">
                <p className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">Just Dropped</p>
                <h3 className="text-white text-3xl font-bold tracking-tight">New Arrivals</h3>
              </div>
            </Link>
            
            <Link href="/categories/accessories" className="relative group flex-1 rounded-[32px] bg-gray-100 overflow-hidden flex items-end p-8 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors min-h-[240px]">
              <div className="relative z-20">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Must Haves</p>
                <h3 className="text-gray-900 text-3xl font-bold tracking-tight">Accessories</h3>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Trust Badges / Value Propositions */}
      <section className="py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-y border-gray-100 py-12">
            <div className="flex flex-col items-center">
              <Truck className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-500 text-sm">Swift and reliable shipping nationwide.</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-500 text-sm">100% safe & encrypted checkout process.</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Support</h3>
              <p className="text-gray-500 text-sm">We&apos;re always here to help you out.</p>
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

function FeaturedSectionHeading() {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Featured Collection</h2>
        <div className="mt-3 h-1 w-16 bg-black mx-auto sm:mx-0 rounded-full"></div>
      </div>
      <Link href="/products" className="inline-flex items-center justify-center gap-1 text-sm font-bold text-gray-600 hover:text-black transition-colors">
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
          {products.map((product) => (
            <ProductCard 
              product={{
                id: product.id,
                title: product.name,
                price: product.discount_price ?? product.price,
                image_url: product.primary_image_url || "/placeholder.png",
                slug: product.slug
              }} 
              key={product.id} 
            />
          ))}
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
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Shop by Category</h2>
        <div className="mt-3 h-1 w-16 bg-black mx-auto sm:mx-0 rounded-full"></div>
      </div>
      <Link href="/categories" className="inline-flex items-center justify-center gap-1 text-sm font-bold text-gray-600 hover:text-black transition-colors">
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