import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getCategoriesWithCounts, getProducts } from "@/lib/supabase/catalog";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getProducts({ featuredOnly: true, sort: "newest", limit: 4 }),
    getCategoriesWithCounts(),
  ]);

  return (
    <main>
      <section id="home-hero" className="home-hero relative isolate m-0 flex h-[100svh] items-center justify-center overflow-x-clip bg-[#F6F6F4] px-4 text-[#111111] sm:px-6">
        <div aria-hidden="true" className="home-hero-glow pointer-events-none absolute left-1/2 top-1/2" />
        <div className="home-hero-content relative z-10 mx-auto w-full max-w-xl text-center">
          <p className="home-hero-muted text-xs font-medium uppercase tracking-[0.28em]">SHEZY</p>
          <h1 className="home-hero-heading mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">Good things, chosen well.</h1>
          <p className="home-hero-muted mt-3 text-base leading-6">A small edit of pieces for everyday use.</p>
          <Link href="/products" className="home-hero-explore mt-7 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium">Explore</Link>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6 sm:gap-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777] sm:text-xs">The SHEZY edit</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-3xl">Featured products</h2></div>
          <Link href="/products" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#444] hover:text-black sm:text-sm">All products <ArrowRight size={15} /></Link>
        </div>
        {featuredProducts.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{featuredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <EmptyState className="home-featured-empty" title="A few good things are on their way" description="Featured pieces will appear here as soon as they are added to the collection." actionHref="/products" actionLabel="Browse all products" />}
      </section>

      <section id="categories" className="scroll-mt-24 border-y border-[#eaeaea] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7 sm:gap-5">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777] sm:text-xs">Browse the collection</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-3xl">Categories</h2></div>
            <Link href="/categories" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#444] hover:text-black sm:text-sm">All categories <ArrowRight size={15} /></Link>
          </div>
          {categories.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{categories.slice(0, 6).map((category) => <CategoryCard category={category} key={category.id} />)}</div> : <EmptyState title="Our categories are taking shape" description="New collections will appear here as the catalogue grows." actionHref="/categories" actionLabel="View categories" />}
        </div>
      </section>
    </main>
  );
}
