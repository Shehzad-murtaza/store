"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Trash2 } from "lucide-react";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { EmptyState } from "@/components/catalog/EmptyState";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { formatPKR } from "@/lib/catalog/format";

export function WishlistView() {
  const { items, ready, remove } = useWishlist();

  if (!ready) {
    return <div aria-label="Loading wishlist" className="animate-pulse space-y-3">
      {Array.from({ length: 2 }, (_, index) => <div key={index} className="h-24 rounded-xl border border-[#eaeaea] bg-white" />)}
    </div>;
  }

  if (!items.length) {
    return <EmptyState title="Your wishlist is empty" description="Tap the heart on any product to save it here for later." actionHref="/products" actionLabel="Browse products" />;
  }

  return <ul className="grid gap-3 sm:gap-4">
    {items.map((item) => {
      const price = item.discountPrice ?? item.price;
      return <li key={item.id} className="flex gap-3 rounded-xl border border-[#eaeaea] bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        <Link href={`/products/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0] sm:size-24">
          {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" /> : <span className="grid h-full place-items-center text-[#999]"><ImageIcon size={20} strokeWidth={1.4} /></span>}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium text-[#222] hover:underline">{item.name}</Link>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#111]">{formatPKR(price)}</span>
                {item.discountPrice !== null && <span className="text-xs text-[#888] line-through">{formatPKR(item.price)}</span>}
              </div>
            </div>
            <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name} from wishlist`} className="shrink-0 rounded-lg p-2 text-[#888] transition-colors hover:bg-[#fff7f6] hover:text-[#a43d35]"><Trash2 size={16} /></button>
          </div>
          <div className="mt-auto pt-3">
            <AddToCartButton compact className="w-full sm:w-auto" product={item} />
          </div>
        </div>
      </li>;
    })}
  </ul>;
}
