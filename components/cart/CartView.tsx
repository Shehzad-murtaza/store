"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { EmptyState } from "@/components/catalog/EmptyState";
import { formatPKR } from "@/lib/catalog/format";
import { SHIPPING_FEE } from "@/lib/catalog/orders";

export function CartView() {
  const { lines, subtotal, ready, setQuantity, removeLine } = useCart();

  if (!ready) {
    return <div aria-label="Loading cart" className="animate-pulse space-y-3">
      {Array.from({ length: 2 }, (_, index) => <div key={index} className="h-24 rounded-xl border border-[#eaeaea] bg-white" />)}
    </div>;
  }

  if (!lines.length) {
    return <EmptyState title="Your cart is empty" description="Browse the collection and add the pieces you like." actionHref="/products" actionLabel="Browse products" />;
  }

  const total = subtotal + SHIPPING_FEE;

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:gap-8">
    <section aria-label="Cart items" className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      <ul className="divide-y divide-[#f0f0f0]">
        {lines.map((line) => <li key={line.productId} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
          <Link href={`/products/${line.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0] sm:size-24">
            {line.imageUrl ? <Image src={line.imageUrl} alt={line.name} fill sizes="96px" className="object-cover" /> : <span className="grid h-full place-items-center text-[#999]"><ImageIcon size={20} strokeWidth={1.4} /></span>}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/products/${line.slug}`} className="line-clamp-2 text-sm font-medium text-[#222] hover:underline">{line.name}</Link>
                <p className="mt-1 text-xs text-[#777]">{formatPKR(line.unitPrice)} each</p>
                {line.maxStock <= 5 && <p className="mt-1 text-[11px] font-medium text-[#8a6b28]">Only {line.maxStock} left</p>}
              </div>
              <button type="button" onClick={() => removeLine(line.productId)} aria-label={`Remove ${line.name} from cart`} className="shrink-0 rounded-lg p-2 text-[#888] transition-colors hover:bg-[#fff7f6] hover:text-[#a43d35]"><Trash2 size={16} /></button>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
              <div className="inline-flex items-center rounded-lg border border-[#eaeaea]">
                <button type="button" onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label={`Decrease ${line.name} quantity`} className="grid size-9 place-items-center rounded-l-lg text-[#444] transition-colors hover:bg-[#f5f5f5]"><Minus size={14} /></button>
                <span className="min-w-9 px-2 text-center text-sm tabular-nums">{line.quantity}</span>
                <button type="button" onClick={() => setQuantity(line.productId, line.quantity + 1)} disabled={line.quantity >= line.maxStock} aria-label={`Increase ${line.name} quantity`} className="grid size-9 place-items-center rounded-r-lg text-[#444] transition-colors hover:bg-[#f5f5f5] disabled:opacity-40 disabled:hover:bg-transparent"><Plus size={14} /></button>
              </div>
              <span className="text-sm font-semibold text-[#111]">{formatPKR(line.unitPrice * line.quantity)}</span>
            </div>
          </div>
        </li>)}
      </ul>
    </section>

    <aside aria-label="Order summary" className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold tracking-[-0.02em]">Order summary</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(subtotal)}</dd></div>
        <div className="flex items-center justify-between"><dt className="text-[#666]">Delivery</dt><dd className="font-medium">{SHIPPING_FEE === 0 ? "Free" : formatPKR(SHIPPING_FEE)}</dd></div>
        <div className="flex items-center justify-between border-t border-[#eaeaea] pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold">{formatPKR(total)}</dd></div>
      </dl>
      <Link href="/checkout" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]">Proceed to checkout <ArrowRight size={16} /></Link>
      <Link href="/products" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#eaeaea] text-sm text-[#444] transition-colors hover:bg-[#fafafa]">Continue shopping</Link>
    </aside>
  </div>;
}
