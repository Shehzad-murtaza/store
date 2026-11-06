"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

export function WishlistHeaderButton() {
  const { count, ready } = useWishlist();
  const label = count > 0 ? `Wishlist, ${count} ${count === 1 ? "item" : "items"}` : "Wishlist";

  return <Link href="/wishlist" aria-label={label} className="public-header-wishlist relative inline-flex size-10 items-center justify-center rounded-lg text-[#111] transition-colors hover:bg-[#f0f0f0]">
    <Heart size={19} strokeWidth={1.7} />
    {ready && count > 0 && <span className="cart-count-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
  </Link>;
}
