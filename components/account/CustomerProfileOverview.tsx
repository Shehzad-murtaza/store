"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { formatPKR } from "@/lib/catalog/format";

export function CustomerProfileOverview() {
  const cart = useCart();
  const wishlist = useWishlist();

  return <div className="mt-7 grid gap-5 lg:grid-cols-2">
    <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Shopping bag</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Your cart <span className="text-sm font-normal text-[#777]">({cart.ready ? cart.count : "…"})</span></h2></div>
        <Link href="/cart" aria-label="View cart" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] text-[#444] transition-colors hover:bg-[#f5f5f5]"><ArrowRight size={16} /></Link>
      </div>
      {!cart.ready ? <SavedListSkeleton /> : cart.lines.length ? <ul className="mt-5 divide-y divide-[#eaeaea]">
        {cart.lines.slice(0, 3).map((line) => <li key={line.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f5f5f3]">
            {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />}
          </div>
          <div className="min-w-0 flex-1"><Link href={`/products/${line.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">{line.name}</Link><p className="mt-1 text-xs text-[#777]">Qty {line.quantity}</p></div>
          <span className="shrink-0 text-sm font-medium">{formatPKR(line.unitPrice * line.quantity)}</span>
        </li>)}
      </ul> : <p className="mt-5 rounded-xl bg-[#f7f7f6] px-4 py-5 text-sm text-[#666]">Your cart is empty. Add something you like and it will stay here for this session.</p>}
      {cart.ready && cart.lines.length > 3 && <p className="mt-3 text-xs text-[#777]">Plus {cart.lines.length - 3} more {cart.lines.length - 3 === 1 ? "item" : "items"}</p>}
      <Link href="/cart" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#333] hover:text-black">Open cart<ArrowRight size={15} /></Link>
    </section>

    <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Saved for later</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Wishlist <span className="text-sm font-normal text-[#777]">({wishlist.ready ? wishlist.count : "…"})</span></h2></div>
        <Link href="/wishlist" aria-label="View wishlist" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] text-[#444] transition-colors hover:bg-[#f5f5f5]"><Heart size={16} /></Link>
      </div>
      {!wishlist.ready ? <SavedListSkeleton /> : wishlist.items.length ? <ul className="mt-5 divide-y divide-[#eaeaea]">
        {wishlist.items.slice(0, 3).map((item) => <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f5f5f3]">
            {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />}
          </div>
          <div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">{item.name}</Link><p className="mt-1 text-xs text-[#777]">{item.sold || item.stock <= 0 ? "Sold out" : "Available"}</p></div>
          <span className="shrink-0 text-sm font-medium">{formatPKR(item.discountPrice ?? item.price)}</span>
        </li>)}
      </ul> : <p className="mt-5 rounded-xl bg-[#f7f7f6] px-4 py-5 text-sm text-[#666]">Your wishlist is empty. Save favorites with the heart button as you browse.</p>}
      {wishlist.ready && wishlist.items.length > 3 && <p className="mt-3 text-xs text-[#777]">Plus {wishlist.items.length - 3} more {wishlist.items.length - 3 === 1 ? "item" : "items"}</p>}
      <Link href="/wishlist" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#333] hover:text-black">Open wishlist<ArrowRight size={15} /></Link>
    </section>
  </div>;
}

function SavedListSkeleton() {
  return <div aria-label="Loading saved items" className="mt-5 space-y-3" role="status">
    {[0, 1].map((row) => <div key={row} className="h-14 animate-pulse rounded-lg bg-[#f3f3f1]" />)}
  </div>;
}
