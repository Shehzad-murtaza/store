"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

export interface AddToCartProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  sold: boolean;
}

export function AddToCartButton({ product, className, label = "Add to cart", compact = false }: {
  product: AddToCartProduct;
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const unavailable = product.sold || product.stock <= 0;

  function handleAdd() {
    if (unavailable) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPrice: product.discountPrice ?? product.price,
      imageUrl: product.imageUrl,
      maxStock: product.stock,
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return <button
    type="button"
    onClick={handleAdd}
    disabled={unavailable}
    aria-label={unavailable ? `${product.name} is sold out` : `Add ${product.name} to cart`}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg border text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
      compact ? "h-9 px-3 text-xs" : "min-h-11 w-full px-4 py-3",
      added ? "border-[#35543a] bg-[#f0f4ef] text-[#35543a]" : "border-[#deded6] bg-white text-[#272a24] hover:bg-[#f5f4ef]",
      className,
    )}
  >
    {unavailable ? "Sold out" : added ? <><Check size={compact ? 14 : 16} />Added</> : <><ShoppingBag size={compact ? 14 : 16} />{label}</>}
  </button>;
}

export function AddToCartPending() {
  return <span aria-hidden="true" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#deded6] bg-white text-[13px] font-medium text-[#999]"><LoaderCircle size={16} className="animate-spin" />Add to cart</span>;
}
