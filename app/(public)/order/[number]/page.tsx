import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, MessageCircle, PackageSearch } from "lucide-react";
import { OrderLookupForm } from "@/components/orders/OrderLookupForm";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { lookupOrder } from "@/lib/supabase/orders-public";
import { SELLER_WHATSAPP } from "@/lib/site";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ phone?: string; placed?: string }>;
};

function LookupShell({ title, description, number }: { title: string; description: string; number: string }) {
  return <div className="mx-auto max-w-lg">
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5f5f4] text-[#555]"><PackageSearch size={20} strokeWidth={1.5} /></span>
      <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#666]">{description}</p>
    </div>
    <div className="mt-7 rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <OrderLookupForm defaultOrderNumber={number} />
    </div>
    <p className="mt-5 text-center text-sm text-[#777]">Just browsing? <Link href="/products" className="font-medium text-[#222] hover:underline">Continue shopping</Link></p>
  </div>;
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { number } = await params;
  const { phone = "", placed } = await searchParams;

  let order = null;
  if (phone.trim()) {
    try {
      order = await lookupOrder(number, phone);
    } catch {
      order = null;
    }
  }

  return <main className="mx-auto min-h-[60vh] w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <BackButton fallbackHref="/products" />

    {order ? <>
      {placed && <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-[#dfe9df] bg-[#f4f8f3] p-4 text-sm text-[#38583d]">
        <CircleCheck size={18} className="mt-0.5 shrink-0" />
        <div><p className="font-medium">Thanks, your order has been received.</p><p className="mt-1 text-xs leading-5 text-[#55705a]">Our team will confirm it on WhatsApp shortly. Keep your order number handy.</p></div>
      </div>}

      <div className="mt-6">
        <OrderSummary order={order.order} items={order.items} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(`Hello, I would like to follow up on my order ${order.order.order_number}.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-5 text-sm font-medium text-white transition-colors hover:bg-[#333]"><MessageCircle size={16} />Follow up on WhatsApp</a>
        <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#eaeaea] px-5 text-sm text-[#444] transition-colors hover:bg-[#fafafa]">Continue shopping</Link>
      </div>
    </> : phone.trim()
      ? <div className="mt-6"><LookupShell number={number} title="Order not found" description="We could not find an order with that number and phone. Please check both and try again." /></div>
      : <div className="mt-6"><LookupShell number={number} title="Confirm your phone number" description={`Enter the phone number you used at checkout to view order ${number}.`} /></div>}
  </main>;
}
