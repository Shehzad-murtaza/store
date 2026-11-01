import Image from "next/image";
import Link from "next/link";
import { ImageIcon, ArrowUpRight } from "lucide-react";
import type { ProductWithCatalogData } from "@/lib/supabase/catalog";
import { formatPKR } from "@/lib/catalog/format";

export function ProductCard({ product }: { product: ProductWithCatalogData }) {
  const hasDiscount = product.discount_price !== null;

  return (
    <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f1f1ef]">
        {product.primary_image_url ? <Image
          src={product.primary_image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#999]">
          <ImageIcon size={22} strokeWidth={1.4} />
          <span className="text-xs">Image coming soon</span>
        </div>}
        {product.is_sold && <span className="absolute left-3 top-3 rounded-md bg-[#1a1a1a] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white">Sold</span>}
        <span className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/95 text-[#333] opacity-0 shadow-sm transition group-hover:opacity-100" aria-hidden="true"><ArrowUpRight size={15} /></span>
      </div>
      <div className="p-4 sm:p-5">
        {product.category && <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-[#777]">{product.category.name}</p>}
        <h3 className="line-clamp-1 text-sm font-medium text-[#222]">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {hasDiscount ? <><span className="font-semibold text-[#111]">{formatPKR(product.discount_price!)}</span><span className="text-xs text-[#888] line-through">{formatPKR(product.price)}</span></> : <span className="font-semibold text-[#111]">{formatPKR(product.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
