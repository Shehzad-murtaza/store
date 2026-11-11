"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { findPublicOrder } from "@/app/(public)/orders/actions";
import { SELLER_WHATSAPP } from "@/lib/site";
import type { PublicOrder } from "@/lib/supabase/orders-public";

export function OrderLookupForm({ defaultOrderNumber = "", className, placed = false }: { defaultOrderNumber?: string; className?: string; placed?: boolean }) {
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicOrder | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = orderNumber.trim();
    const phoneValue = phone.trim();
    const digits = phoneValue.replace(/\D/g, "");

    setError("");
    setResult(null);
    if (!number || number.length > 40) {
      setError("Enter a valid order number.");
      return;
    }
    if (!((digits.length === 11 && digits.startsWith("03")) || (digits.length === 12 && digits.startsWith("923")))) {
      setError("Enter the complete Pakistani phone number used at checkout.");
      return;
    }

    setBusy(true);
    try {
      const response = await findPublicOrder(number, phoneValue);
      if (!response.order) setError(response.error ?? "We could not verify those details. Please try again.");
      else setResult(response.order);
    } catch {
      setError("We could not verify those details. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return <div className={className}>
      {placed && <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-[#dfe9df] bg-[#f4f8f3] p-4 text-sm text-[#38583d]">
        <span aria-hidden="true">✓</span>
        <div><p className="font-medium">Thanks, your order has been received.</p><p className="mt-1 text-xs leading-5 text-[#55705a]">Our team will confirm it on WhatsApp shortly. Keep your order number handy.</p></div>
      </div>}
      <OrderSummary order={result.order} items={result.items} />
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(`Hello, I would like to follow up on my order ${result.order.order_number}.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-5 text-sm font-medium text-white transition-colors hover:bg-[#333]"><MessageCircle size={16} />Follow up on WhatsApp</a>
        <button type="button" onClick={() => { setResult(null); setPhone(""); }} className="inline-flex h-11 items-center justify-center rounded-lg border border-[#eaeaea] px-5 text-sm text-[#444] transition-colors hover:bg-[#fafafa]">Look up another order</button>
        <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#eaeaea] px-5 text-sm text-[#444] transition-colors hover:bg-[#fafafa]">Continue shopping</Link>
      </div>
    </div>;
  }

  return <form onSubmit={handleSubmit} className={className} noValidate>
    <div className="grid gap-5">
      <label className="contact-field"><span>Order number</span><Input name="orderNumber" required maxLength={40} autoComplete="off" value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); setError(""); }} placeholder="ORD-1001" className="contact-input" /></label>
      <label className="contact-field"><span>Phone number used at checkout</span><Input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={40} value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} placeholder="03XX-XXXXXXX" className="contact-input" /></label>
    </div>
    {error && <p className="field-error mt-3" role="alert">{error}</p>}
    <button type="submit" disabled={busy} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
      {busy ? <><LoaderCircle size={16} className="animate-spin" />Verifying…</> : <><Search size={16} />Find my order</>}
    </button>
  </form>;
}
