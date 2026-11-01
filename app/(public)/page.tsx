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
      <section id="home-hero" className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#111111] px-4 text-white dark:bg-[#161616] sm:px-6">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden whitespace-nowrap text-[29vw] font-semibold leading-none tracking-[-0.07em] text-white/[0.06]">
          SHEZY
        </span>
        <div className="relative z-10 mx-auto w-full max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">SHEZY</p>
          <h1 className="mt-4 whitespace-nowrap text-[clamp(1.2rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.045em] text-white">Good things, chosen well.</h1>
          <p className="mt-3 whitespace-nowrap text-sm leading-6 text-white/70">A small edit of pieces for everyday use.</p>
          <Link href="/products" className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-[#111111] transition hover:bg-white/90">Explore</Link>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">The SHEZY edit</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Featured products</h2></div>
          <Link href="/products" className="hidden items-center gap-1 text-sm font-medium text-[#444] hover:text-black sm:inline-flex">All products <ArrowRight size={15} /></Link>
        </div>
        {featuredProducts.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <EmptyState title="A few good things are on their way" description="Featured pieces will appear here as soon as they are added to the collection." actionHref="/products" actionLabel="Browse all products" />}
      </section>

      <section id="categories" className="scroll-mt-24 border-y border-[#eaeaea] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Browse the collection</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Categories</h2></div>
            <Link href="/categories" className="hidden items-center gap-1 text-sm font-medium text-[#444] hover:text-black sm:inline-flex">All categories <ArrowRight size={15} /></Link>
          </div>
          {categories.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.slice(0, 6).map((category) => <CategoryCard category={category} key={category.id} />)}</div> : <EmptyState title="Our categories are taking shape" description="New collections will appear here as the catalogue grows." actionHref="/categories" actionLabel="View categories" />}
          <div className="mt-5 sm:hidden"><Link href="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-[#444]">View all categories <ArrowRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  );
}
