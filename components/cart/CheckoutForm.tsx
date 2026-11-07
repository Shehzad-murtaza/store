"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, CheckCircle2, CreditCard, LoaderCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useDeliveryQuote } from "@/components/cart/useDeliveryQuote";
import { placeOrder } from "@/app/(public)/checkout/actions";
import { formatPKR } from "@/lib/catalog/format";
import type { PaymentMethod } from "@/types";

export default function CheckoutForm({ defaultDeliveryFee }: { defaultDeliveryFee: number }) {
  const { lines, subtotal, ready, clear } = useCart();
  const deliveryQuote = useDeliveryQuote(lines, defaultDeliveryFee);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const router = useRouter();
  const productDelivery = lines.reduce((sum, line) => sum + deliveryQuote.feeFor(line) * line.quantity, 0);
  const deliveryTotal = deliveryQuote.defaultDeliveryFee + productDelivery;
  const total = subtotal + (lines.length ? deliveryTotal : 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !lines.length) return;
    setSubmitting(true);
    setError("");

    const values = new FormData(event.currentTarget);
    try {
      const result = await placeOrder({
        customerName: String(values.get("customerName") ?? ""),
        customerPhone: String(values.get("customerPhone") ?? ""),
        customerEmail: String(values.get("customerEmail") ?? ""),
        address: String(values.get("address") ?? ""),
        city: String(values.get("city") ?? ""),
        notes: String(values.get("notes") ?? ""),
        paymentMethod,
        items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
      });

      if (!result.ok || !result.orderNumber) {
        setError(result.error || "We could not place your order. Please try again.");
        return;
      }

      clear();
      setOrderNumber(result.orderNumber);
      router.refresh();
    } catch {
      setError("We could not place your order. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return <div aria-label="Loading checkout" className="grid gap-6 animate-pulse lg:grid-cols-[minmax(0,1fr)_360px]">
    <div className="h-[420px] rounded-xl border border-[#eaeaea] bg-white" />
    <div className="h-64 rounded-xl border border-[#eaeaea] bg-white" />
  </div>;

  if (orderNumber) return <section role="status" className="mx-auto max-w-xl rounded-xl border border-[#dfe9df] bg-[#f4f8f3] px-5 py-8 text-center sm:px-8 sm:py-10">
    <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-[#45614a]"><CheckCircle2 size={23} /></span>
    <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#243b28]">Your order is confirmed</h2>
    <p className="mt-2 text-sm leading-6 text-[#55705a]">We’ll be in touch to confirm the details. Keep your order number handy.</p>
    <p className="mt-4 inline-flex rounded-lg border border-[#dfe9df] bg-white px-4 py-2 text-sm font-semibold tracking-wide text-[#243b28]">{orderNumber}</p>
    <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
      <Link href={`/order/${encodeURIComponent(orderNumber)}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#111] px-4 text-sm font-medium text-white hover:bg-[#333]">Track this order</Link>
      <Link href="/products" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfe9df] bg-white px-4 text-sm font-medium text-[#333] hover:bg-[#f7f7f7]">Continue shopping</Link>
    </div>
  </section>;

  if (!lines.length) return <section className="grid min-h-[36vh] place-items-center rounded-xl border border-[#eaeaea] bg-white px-5 py-10 text-center shadow-sm">
    <div className="max-w-sm"><span className="mx-auto grid size-12 place-items-center rounded-full border border-[#eaeaea] bg-[#f7f7f6] text-[#555]"><ShoppingBag size={19} /></span><h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2><p className="mt-2 text-sm leading-6 text-[#666]">Add a piece to your cart before checking out.</p><Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#111] px-4 text-sm font-medium text-white hover:bg-[#333]">Browse products</Link></div>
  </section>;

  return <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
    <form id="checkout-form" onSubmit={handleSubmit} className="grid min-w-0 gap-4 sm:gap-5">
      <section className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-[#eaeaea] pb-4"><span className="grid size-8 place-items-center rounded-full bg-[#111] text-xs font-semibold text-white">1</span><div><h2 className="text-sm font-semibold">Contact information</h2><p className="mt-0.5 text-xs text-[#777]">How can we reach you about your order?</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="contact-field sm:col-span-2"><span>Full name</span><input name="customerName" autoComplete="name" maxLength={120} required className="contact-input" placeholder="Your name" /></label>
          <label className="contact-field"><span>Phone number</span><input name="customerPhone" type="tel" autoComplete="tel" maxLength={40} required className="contact-input" placeholder="03XX-XXXXXXX" /></label>
          <label className="contact-field"><span>Email <small>(optional)</small></span><input name="customerEmail" type="email" autoComplete="email" maxLength={254} className="contact-input" placeholder="you@example.com" /></label>
        </div>
      </section>

      <section className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-[#eaeaea] pb-4"><span className="grid size-8 place-items-center rounded-full bg-[#111] text-xs font-semibold text-white">2</span><div><h2 className="text-sm font-semibold">Delivery address</h2><p className="mt-0.5 text-xs text-[#777]">Where should we send your order?</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="contact-field sm:col-span-2"><span>Street address</span><textarea name="address" autoComplete="street-address" maxLength={500} rows={3} required className="contact-input min-h-24 resize-y py-3" placeholder="House, street, and area" /></label>
          <label className="contact-field"><span>City</span><input name="city" autoComplete="address-level2" maxLength={120} required className="contact-input" placeholder="Your city" /></label>
          <label className="contact-field"><span>Order note <small>(optional)</small></span><input name="notes" maxLength={1000} className="contact-input" placeholder="Delivery instructions" /></label>
        </div>
      </section>

      <section className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-[#eaeaea] pb-4"><span className="grid size-8 place-items-center rounded-full bg-[#111] text-xs font-semibold text-white">3</span><div><h2 className="text-sm font-semibold">Payment method</h2><p className="mt-0.5 text-xs text-[#777]">Choose how you would like to pay.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentChoice value="cod" selected={paymentMethod === "cod"} onSelect={setPaymentMethod} icon={<Banknote size={18} />} title="Cash on delivery" description="Pay when your order arrives" />
          <PaymentChoice value="bank" selected={paymentMethod === "bank"} onSelect={setPaymentMethod} icon={<CreditCard size={18} />} title="Bank transfer" description="We’ll share transfer details" />
        </div>
      </section>
      {error && <p role="alert" className="rounded-lg border border-[#e4c4c1] bg-[#fff7f6] px-4 py-3 text-sm text-[#7c3732]">{error}</p>}
      <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#111] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-wait disabled:opacity-60 sm:hidden">
        {submitting ? <><LoaderCircle size={16} className="animate-spin" />Placing order…</> : <><ShieldCheck size={16} />Place order · {formatPKR(total)}</>}
      </button>
    </form>

    <aside className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-base font-semibold tracking-[-0.02em]">Your order</h2>
      <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto border-b border-[#eaeaea] pb-4">
        {lines.map((line) => <li key={line.productId} className="flex items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f5f5f3]">
            {line.imageUrl ? <Image src={line.imageUrl} alt={line.name} fill sizes="56px" className="object-contain p-1" /> : <span className="absolute inset-0 grid place-items-center text-[9px] text-[#888]">No image</span>}
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#111] text-[10px] font-medium text-white">{line.quantity}</span>
          </div>
          <div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-medium leading-5">{line.name}</p><p className="mt-0.5 text-xs text-[#777]">{line.quantity} × {formatPKR(line.unitPrice)}</p>{deliveryQuote.feeFor(line) > 0 && <p className="mt-0.5 text-[10px] text-[#777]">Extra delivery: {formatPKR(deliveryQuote.feeFor(line))} each</p>}</div>
          <span className="shrink-0 text-xs font-semibold">{formatPKR(line.unitPrice * line.quantity)}</span>
        </li>)}
      </ul>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(subtotal)}</dd></div>
        <div className="flex items-center justify-between gap-3"><dt className="text-[#666]">Base delivery</dt><dd className="font-medium">{deliveryQuote.defaultDeliveryFee ? formatPKR(deliveryQuote.defaultDeliveryFee) : "Free"}</dd></div>
        {productDelivery > 0 && <div className="flex items-center justify-between gap-3"><dt className="text-[#666]">Product delivery extras</dt><dd className="font-medium">{formatPKR(productDelivery)}</dd></div>}
        <div className="flex items-center justify-between gap-3 border-t border-[#eaeaea] pt-3"><dt className="font-semibold">Total</dt><dd className="text-base font-semibold">{formatPKR(total)}</dd></div>
      </dl>
      <button type="submit" form="checkout-form" disabled={submitting} className="mt-5 hidden h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#111] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-wait disabled:opacity-60 sm:inline-flex">
        {submitting ? <><LoaderCircle size={16} className="animate-spin" />Placing order…</> : <><ShieldCheck size={16} />Place order</>}
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#777]">Your order is confirmed by our team before fulfilment.</p>
    </aside>
  </div>;
}

function PaymentChoice({ value, selected, onSelect, icon, title, description }: { value: PaymentMethod; selected: boolean; onSelect: (value: PaymentMethod) => void; icon: ReactNode; title: string; description: string }) {
  return <label className={`flex min-h-[76px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${selected ? "border-[#111] bg-[#f5f5f5]" : "border-[#eaeaea] hover:bg-[#fafafa]"}`}>
    <input type="radio" name="paymentMethod" value={value} checked={selected} onChange={() => onSelect(value)} className="sr-only" />
    <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${selected ? "bg-[#111] text-white" : "bg-[#f1f1f1] text-[#555]"}`}>{icon}</span>
    <span><span className="block text-xs font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-[#777]">{description}</span></span>
  </label>;
}
