import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import type { CategoryWithCount } from "@/lib/supabase/catalog";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block min-w-0 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f1f1ef] sm:aspect-[5/3]">
        {category.image_url ? <Image src={category.image_url} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full items-center justify-center text-[#999]"><Layers3 size={25} strokeWidth={1.3} /></div>}
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2 p-3 sm:gap-3 sm:p-5">
        <div className="min-w-0"><h2 className="line-clamp-1 text-sm font-semibold tracking-[-0.02em] sm:text-base">{category.name}</h2><p className="mt-1 text-[11px] text-[#777] sm:text-xs">{category.product_count} {category.product_count === 1 ? "product" : "products"}</p></div>
        <ArrowRight size={16} className="shrink-0 text-[#666] transition-transform group-hover:translate-x-1 sm:size-[17px]" />
      </div>
    </Link>
  );
}
