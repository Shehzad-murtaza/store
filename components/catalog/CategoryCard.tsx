import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import type { CategoryWithCount } from "@/lib/supabase/catalog";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[5/3] overflow-hidden bg-[#f1f1ef]">
        {category.image_url ? <Image src={category.image_url} alt={category.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full items-center justify-center text-[#999]"><Layers3 size={25} strokeWidth={1.3} /></div>}
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div><h2 className="text-base font-semibold tracking-[-0.02em]">{category.name}</h2><p className="mt-1 text-xs text-[#777]">{category.product_count} {category.product_count === 1 ? "product" : "products"}</p></div>
        <ArrowRight size={17} className="text-[#666] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
