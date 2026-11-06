import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { getCustomerOrder, requireCustomer } from "@/lib/supabase/customer";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ number: string }> };

export default async function AccountOrderPage({ params }: PageProps) {
  const { number } = await params;
  const orderNumber = decodeURIComponent(number);
  await requireCustomer(`/account/orders/${encodeURIComponent(orderNumber)}`);

  const order = await getCustomerOrder(orderNumber);
  if (!order) notFound();

  return <main className="mx-auto min-h-[60vh] w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <Link href="/account" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to my orders</Link>
    <div className="mt-6"><OrderSummary order={order.order} items={order.items} /></div>
  </main>;
}
