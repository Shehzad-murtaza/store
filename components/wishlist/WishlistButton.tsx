"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/components/wishlist/WishlistProvider";
import { cn } from "@/lib/utils";

export function WishlistButton({ item, className, size = 17, label }: {
  item: WishlistItem;
  className?: string;
  size?: number;
  label?: string;
}) {
  const { has, toggle, ready } = useWishlist();
  const active = ready && has(item.id);

  return <button
    type="button"
    onClick={() => toggle(item)}
    aria-pressed={active}
    aria-label={active ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
    className={cn(className, active && "is-active")}
  >
    <Heart size={size} strokeWidth={1.8} className={active ? "fill-current" : undefined} aria-hidden="true" />
    {label ? <span>{active ? "Saved" : label}</span> : null}
  </button>;
}
