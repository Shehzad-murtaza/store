"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CircleAlert, ImageIcon, LoaderCircle, Lock, Truck, Wallet } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { EmptyState } from "@/components/catalog/EmptyState";
import { Input } from "@/components/ui/input";
import { placeOrder } from "@/app/(public)/checkout/actions";
import { formatPKR } from "@/lib/catalog/format";
import { SHIPPING_FEE } from "@/lib/catalog/orders";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"customerName" | "customerPhone" | "address" | "city", string>>;

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, ready, clear } = useCart();
  const [values, setValues] = useState({ customerName: "", customerPhone: "", customerEmail: "", address: "", city: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!values.customerName.trim()) next.customerName = "Please enter your name.";
    if (!values.customerPhone.trim()) next.customerPhone = "Please enter your phone number.";
    if (!values.address.trim()) next.address = "Please enter your delivery address.";
    if (!values.city.trim()) next.city = "Please enter your city.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!lines.length) return;
    if (!validate()) return;

    setSubmitting(true);
    setFormError("");
    try {
      const result = await placeOrder({
        ...values,
        paymentMethod,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      });
      if (!result.ok || !result.orderNumber) {
        setFormError(result.error ?? "The order could not be placed. Please try again.");
        return;
      }
      clear();
      router.push(`/order/${encodeURIComponent(result.orderNumber)}?phone=${encodeURIComponent(values.customerPhone)}&placed=1`);
    } catch {
      setFormError("The order could not be placed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (ready && !lines.length) {
    return <EmptyState title="Your cart is empty" description="Add a few pieces to your cart before checking out." actionHref="/products" actionLabel="Browse products" />;
  }

  const total = subtotal + SHIPPING_FEE;

  return <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)] lg:gap-8" noValidate>
    <div className="space-y-6">
      <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold tracking-[-0.02em]">Delivery details</h2>
        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="contact-field"><span>Full name</span><Input name="customerName" autoComplete="name" required maxLength={120} value={values.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="Your name" className={cn("contact-input", errors.customerName && "border-[#e0b4b0]")} aria-invalid={Boolean(errors.customerName)} />{errors.customerName && <small className="field-error" role="alert">{errors.customerName}</small>}</label>
            <label className="contact-field"><span>Phone number</span><Input name="customerPhone" type="tel" autoComplete="tel" required maxLength={40} value={values.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} placeholder="03XX-XXXXXXX" className={cn("contact-input", errors.customerPhone && "border-[#e0b4b0]")} aria-invalid={Boolean(errors.customerPhone)} />{errors.customerPhone && <small className="field-error" role="alert">{errors.customerPhone}</small>}</label>
          </div>
          <label className="contact-field"><span>Email <small>(optional)</small></span><Input name="customerEmail" type="email" autoComplete="email" maxLength={254} value={values.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} placeholder="you@example.com" className="contact-input" /></label>
          <label className="contact-field"><span>Delivery address</span><textarea name="address" required maxLength={500} rows={3} value={values.address} onChange={(event) => update("address", event.target.value)} placeholder="House / street / area" className={cn("contact-textarea", errors.address && "border-[#e0b4b0]")} aria-invalid={Boolean(errors.address)} />{errors.address && <small className="field-error" role="alert">{errors.address}</small>}</label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="contact-field"><span>City</span><Input name="city" autoComplete="address-level2" required maxLength={120} value={values.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className={cn("contact-input", errors.city && "border-[#e0b4b0]")} aria-invalid={Boolean(errors.city)} />{errors.city && <small className="field-error" role="alert">{errors.city}</small>}</label>
            <label className="contact-field"><span>Order notes <small>(optional)</small></span><Input name="notes" maxLength={500} value={values.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Landmark or instructions" className="contact-input" /></label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold tracking-[-0.02em]">Payment method</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setPaymentMethod("cod")} aria-pressed={paymentMethod === "cod"} className={cn("flex items-start gap-3 rounded-lg border p-4 text-left transition-colors", paymentMethod === "cod" ? "border-[#1a1a1a] bg-[#fafafa] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea] hover:bg-[#fafafa]")}>
            <Truck size={18} className="mt-0.5 shrink-0 text-[#555]" />
            <span><span className="block text-sm font-medium">Cash on delivery</span><span className="mt-1 block text-xs leading-5 text-[#777]">Pay in cash when your order arrives.</span></span>
          </button>
          <button type="button" onClick={() => setPaymentMethod("bank")} aria-pressed={paymentMethod === "bank"} className={cn("flex items-start gap-3 rounded-lg border p-4 text-left transition-colors", paymentMethod === "bank" ? "border-[#1a1a1a] bg-[#fafafa] ring-1 ring-[#1a1a1a]" : "border-[#eaeaea] hover:bg-[#fafafa]")}>
            <Wallet size={18} className="mt-0.5 shrink-0 text-[#555]" />
            <span><span className="block text-sm font-medium">Bank transfer</span><span className="mt-1 block text-xs leading-5 text-[#777]">We share the account details on WhatsApp after you order.</span></span>
          </button>
        </div>
      </section>
    </div>

    <aside aria-label="Order summary" className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold tracking-[-0.02em]">Your order</h2>
      <ul className="mt-4 space-y-3">
        {lines.map((line) => <li key={line.productId} className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f2f2f0]">{line.imageUrl ? <Image src={line.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <span className="grid h-full place-items-center text-[#999]"><ImageIcon size={16} strokeWidth={1.4} /></span>}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-[#222]">{line.name}</p><p className="mt-0.5 text-xs text-[#777]">{line.quantity} × {formatPKR(line.unitPrice)}</p></div>
          <span className="shrink-0 text-[13px] font-medium">{formatPKR(line.unitPrice * line.quantity)}</span>
        </li>)}
      </ul>
      <dl className="mt-5 space-y-2.5 border-t border-[#eaeaea] pt-4 text-sm">
        <div className="flex items-center justify-between"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(subtotal)}</dd></div>
        <div className="flex items-center justify-between"><dt className="text-[#666]">Delivery</dt><dd className="font-medium">{SHIPPING_FEE === 0 ? "Free" : formatPKR(SHIPPING_FEE)}</dd></div>
        <div className="flex items-center justify-between border-t border-[#eaeaea] pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold">{formatPKR(total)}</dd></div>
      </dl>
      {formError && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-[#e4c4c1] bg-[#fff7f6] p-3 text-xs leading-5 text-[#963d35]"><CircleAlert size={15} className="mt-0.5 shrink-0" />{formError}</div>}
      <button type="submit" disabled={submitting || !ready || !lines.length} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
        {submitting ? <><LoaderCircle size={16} className="animate-spin" />Placing order…</> : <><Lock size={15} />Place order</>}
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#888]">You will get an order number to track this order.</p>
      <Link href="/cart" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#eaeaea] text-sm text-[#444] transition-colors hover:bg-[#fafafa]">Back to cart</Link>
    </aside>
  </form>;
}
