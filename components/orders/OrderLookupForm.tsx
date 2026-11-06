"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function OrderLookupForm({ defaultOrderNumber = "", className }: { defaultOrderNumber?: string; className?: string }) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const number = orderNumber.trim();
    const phoneValue = phone.trim();
    if (!number || !phoneValue) {
      setError("Enter both your order number and phone number.");
      return;
    }
    setBusy(true);
    router.push(`/order/${encodeURIComponent(number)}?phone=${encodeURIComponent(phoneValue)}`);
  }

  return <form onSubmit={handleSubmit} className={className} noValidate>
    <div className="grid gap-5">
      <label className="contact-field"><span>Order number</span><Input name="orderNumber" required maxLength={40} value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); setError(""); }} placeholder="ORD-1001" className="contact-input" /></label>
      <label className="contact-field"><span>Phone number used at checkout</span><Input name="phone" type="tel" required maxLength={40} value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} placeholder="03XX-XXXXXXX" className="contact-input" /></label>
    </div>
    {error && <p className="field-error mt-3" role="alert">{error}</p>}
    <button type="submit" disabled={busy} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
      {busy ? <><LoaderCircle size={16} className="animate-spin" />Searching…</> : <><Search size={16} />Find my order</>}
    </button>
  </form>;
}
