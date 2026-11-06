import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { formatPKR } from "@/lib/catalog/format";
import type { ProductCardData } from "@/lib/supabase/catalog";

export default function ProductCard({ product }: { product: ProductCardData }) {
  const price = product.discount_price ?? product.price;
  const unavailable = product.is_sold || product.stock_quantity <= 0;
  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    discountPrice: product.discount_price,
    imageUrl: product.primary_image_url,
    stock: product.stock_quantity,
    sold: product.is_sold,
  };

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#eaeaea] bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-lg bg-[#f5f5f3]" aria-label={`View ${product.name}`}>
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.name}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-xs text-[#777]">Image coming soon</span>
        )}
        {unavailable && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#555] shadow-sm">Sold</span>}
        {!unavailable && product.discount_price !== null && <span className="absolute left-2 top-2 rounded-full bg-[#111] px-2.5 py-1 text-[10px] font-semibold text-white">Sale</span>}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col px-0.5 pt-3">
        {product.category && <Link href={`/categories/${product.category.slug}`} className="mb-1 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#777] hover:text-[#111]">{product.category.name}</Link>}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-[#222] hover:text-[#666] sm:text-sm">{product.name}</Link>
        <div className="mt-2 flex min-h-5 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-[#111]">{formatPKR(price)}</span>
          {product.discount_price !== null && <span className="text-xs text-[#888] line-through">{formatPKR(product.price)}</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AddToCartButton product={cartProduct} compact className="product-card-cart min-w-0 flex-1" label="Add to cart" />
          <WishlistButton item={cartProduct} className="wishlist-card-button" size={16} />
        </div>
      </div>
    </article>
  );
}
