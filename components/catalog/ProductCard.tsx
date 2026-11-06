import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import type { ProductCardData } from "@/lib/supabase/catalog";
import { formatPKR } from "@/lib/catalog/format";
import { isOutOfStock } from "@/lib/catalog/orders";

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount = product.discount_price !== null;
  const outOfStock = isOutOfStock(product);
  const lowStock = !outOfStock && product.stock_quantity <= 5;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="flex min-w-0 flex-1 flex-col">
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
          {outOfStock
            ? <span className="absolute left-2.5 top-2.5 rounded-md bg-[#1a1a1a] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">Sold out</span>
            : hasDiscount && <span className="absolute left-2.5 top-2.5 rounded-md bg-[#f5f2e9] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#786536] sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">Sale</span>}
        </div>
        <div className="min-w-0 p-3 pb-2 sm:p-4 sm:pb-2.5 lg:px-5 lg:pt-5">
          {product.category && <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.1em] text-[#777] sm:mb-1.5 sm:text-[10px] sm:tracking-[0.13em]">{product.category.name}</p>}
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-[#222] sm:text-sm">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm">
            {hasDiscount ? <><span className="font-semibold text-[#111]">{formatPKR(product.discount_price!)}</span><span className="text-[10px] text-[#888] line-through sm:text-xs">{formatPKR(product.price)}</span></> : <span className="font-semibold text-[#111]">{formatPKR(product.price)}</span>}
          </div>
          {lowStock && <p className="mt-1.5 text-[10px] font-medium text-[#8a6b28] sm:text-[11px]">Only {product.stock_quantity} left</p>}
        </div>
      </Link>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
        <AddToCartButton
          compact
          className="w-full"
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            discountPrice: product.discount_price,
            imageUrl: product.primary_image_url,
            stock: product.stock_quantity,
            sold: product.is_sold,
          }}
        />
      </div>
    </article>
  );
}
