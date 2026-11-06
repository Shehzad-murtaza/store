"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { count, ready } = useCart();
  const label = count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart";

  return <Link href="/cart" aria-label={label} className="public-header-cart relative inline-flex size-10 items-center justify-center rounded-lg text-[#111] transition-colors hover:bg-[#f0f0f0]">
    <ShoppingBag size={19} strokeWidth={1.7} />
    {ready && count > 0 && <span className="cart-count-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
  </Link>;
}
