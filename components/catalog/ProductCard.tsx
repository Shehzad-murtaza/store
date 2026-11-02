import Image from "next/image";
import Link from "next/link";
import { ImageIcon, ArrowUpRight } from "lucide-react";
import type { ProductCardData } from "@/lib/supabase/catalog";
import { formatPKR } from "@/lib/catalog/format";

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount = product.discount_price !== null;

  return (
    <Link href={`/products/${product.slug}`} className="group block min-w-0 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-[#f1f1ef] sm:aspect-[4/3]">
        {product.primary_image_url ? <Image
          src={product.primary_image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#999]">
          <ImageIcon size={22} strokeWidth={1.4} />
          <span className="text-xs">Image coming soon</span>
        </div>}
        {product.is_sold && <span className="absolute left-2.5 top-2.5 rounded-md bg-[#1a1a1a] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">Sold</span>}
        <span className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/95 text-[#333] opacity-0 shadow-sm transition group-hover:opacity-100" aria-hidden="true"><ArrowUpRight size={15} /></span>
      </div>
      <div className="min-w-0 p-3 sm:p-4 lg:p-5">
        {product.category && <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#777] sm:mb-1.5 sm:text-[10px] sm:tracking-[0.13em]">{product.category.name}</p>}
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-[#222] sm:text-sm">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm">
          {hasDiscount ? <><span className="font-semibold text-[#111]">{formatPKR(product.discount_price!)}</span><span className="text-[10px] text-[#888] line-through sm:text-xs">{formatPKR(product.price)}</span></> : <span className="font-semibold text-[#111]">{formatPKR(product.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
