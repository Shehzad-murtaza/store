"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPKR } from "@/lib/catalog/format";
import { SHIPPING_FEE } from "@/lib/catalog/orders";

export default function CartView() {
  const { lines, subtotal, ready, setQuantity, removeLine } = useCart();

  if (!ready) return <div aria-label="Loading cart" className="grid gap-6 animate-pulse lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="h-64 rounded-xl border border-[#eaeaea] bg-white" />
    <div className="h-56 rounded-xl border border-[#eaeaea] bg-white" />
  </div>;

  if (!lines.length) return <section className="grid min-h-[36vh] place-items-center rounded-xl border border-[#eaeaea] bg-white px-5 py-10 text-center shadow-sm">
    <div className="max-w-sm">
      <span className="mx-auto grid size-12 place-items-center rounded-full border border-[#eaeaea] bg-[#f7f7f6] text-[#555]"><ShoppingBag size={19} strokeWidth={1.5} /></span>
      <h2 className="mt-4 text-lg font-semibold tracking-[-0.03em]">Your cart is empty</h2>
      <p className="mt-2 text-sm leading-6 text-[#666]">Take a look through the collection and save the pieces you love here.</p>
      <Link href="/products" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#333]">Browse products<ArrowRight size={15} /></Link>
    </div>
  </section>;

  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;

  return <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
    <section aria-label="Cart items" className="divide-y divide-[#eaeaea] overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      {lines.map((line) => <article key={line.productId} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4">
        <Link href={`/products/${line.slug}`} aria-label={`View ${line.name}`} className="relative aspect-square overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f5f5f3]">
          {line.imageUrl ? <Image src={line.imageUrl} alt={line.name} fill sizes="96px" className="object-contain p-1.5" /> : <span className="absolute inset-0 grid place-items-center text-[10px] text-[#888]">No image</span>}
        </Link>
        <div className="flex min-w-0 flex-col justify-center">
          <Link href={`/products/${line.slug}`} className="line-clamp-2 text-sm font-medium leading-5 text-[#222] hover:text-[#666]">{line.name}</Link>
          <p className="mt-1 text-xs text-[#777]">{formatPKR(line.unitPrice)} each</p>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-end sm:gap-4">
          <QuantityControl name={line.name} quantity={line.quantity} max={line.maxStock} onChange={(next) => setQuantity(line.productId, next)} />
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm font-semibold sm:w-24 sm:text-right">{formatPKR(line.unitPrice * line.quantity)}</span>
            <button type="button" onClick={() => removeLine(line.productId)} aria-label={`Remove ${line.name} from cart`} className="grid size-8 place-items-center rounded-lg text-[#777] transition-colors hover:bg-[#fff7f6] hover:text-[#a43d35]"><Trash2 size={15} /></button>
          </div>
        </div>
      </article>)}
    </section>

    <aside className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-base font-semibold tracking-[-0.02em]">Order summary</h2>
      <dl className="mt-5 space-y-3 border-b border-[#eaeaea] pb-5 text-sm">
        <div className="flex items-center justify-between gap-3"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(subtotal)}</dd></div>
        <div className="flex items-center justify-between gap-3"><dt className="text-[#666]">Delivery</dt><dd className="font-medium">{shipping ? formatPKR(shipping) : "Free"}</dd></div>
      </dl>
      <div className="flex items-center justify-between gap-3 py-4"><span className="text-sm font-semibold">Total</span><span className="text-lg font-semibold tracking-[-0.02em]">{formatPKR(total)}</span></div>
      <Link href="/checkout" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#111] px-4 text-sm font-medium text-white transition-colors hover:bg-[#333]">Continue to checkout<ArrowRight size={15} /></Link>
      <Link href="/products" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm text-[#555] transition-colors hover:bg-[#f5f5f5]">Continue shopping</Link>
    </aside>
  </div>;
}

function QuantityControl({ name, quantity, max, onChange }: { name: string; quantity: number; max: number; onChange: (quantity: number) => void }) {
  return <div className="inline-flex h-9 items-center rounded-lg border border-[#eaeaea] bg-white">
    <button type="button" onClick={() => onChange(quantity - 1)} disabled={quantity <= 1} aria-label={`Decrease quantity of ${name}`} className="grid size-8 place-items-center rounded-l-lg text-[#555] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"><Minus size={13} /></button>
    <span aria-live="polite" className="w-7 text-center text-xs font-medium tabular-nums">{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)} disabled={quantity >= max} aria-label={`Increase quantity of ${name}`} className="grid size-8 place-items-center rounded-r-lg text-[#555] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={13} /></button>
  </div>;
}
