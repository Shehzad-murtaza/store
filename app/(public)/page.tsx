import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ImageIcon, Truck, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import ProductCard from "@/components/catalog/ProductCard"; // Fixed default import here
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
      
      {/* 1. Hero Banner Section (Modernized) */}
      <section className="relative w-full h-[75vh] min-h-[500px] flex items-center justify-center bg-[#F6F6F4] overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-70"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-md">
            New Collection Arrived
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
            Elevate Your <br className="hidden sm:block" /> Everyday Style.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Good things, chosen well. A small edit of pieces for everyday use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products" className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Shop Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/categories" className="w-full sm:w-auto bg-white text-black border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-black transition-all flex items-center justify-center">
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges / Value Propositions */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center p-4">
              <Truck className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-500 text-sm">Swift and reliable shipping nationwide.</p>
            </div>
            <div className="flex flex-col items-center p-4 pt-8 md:pt-4">
              <ShieldCheck className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-500 text-sm">100% safe & encrypted checkout process.</p>
            </div>
            <div className="flex flex-col items-center p-4 pt-8 md:pt-4">
              <Clock className="h-10 w-10 text-black mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Support</h3>
              <p className="text-gray-500 text-sm">We're always here to help you out.</p>
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
    <section id="featured" className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 bg-gray-50">
      <FeaturedSectionHeading />
      {products.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            // Added simple mapping if your product schema doesn't perfectly match the component interface
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
    <section id="featured" className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 bg-gray-50">
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
    <section id="categories" className="bg-white">
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
    <section id="categories" className="bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <CategoriesHeading />
        <div aria-label="Loading categories" className="grid grid-cols-2 gap-4 animate-pulse sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm aspect-video" />
          ))}
        </div>
      </div>
    </section>
  );
}