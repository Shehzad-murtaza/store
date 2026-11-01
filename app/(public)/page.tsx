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
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#666]">A considered collection</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#111] sm:text-5xl lg:text-[60px]">Good things, chosen well.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#666] sm:text-lg">Discover a thoughtful edit of pieces for the way you live. A little less, a little better.</p>
          <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#333] hover:shadow-md">Explore the collection <ArrowRight size={16} /></Link>
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
