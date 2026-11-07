import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { getCustomerOrder, requireCustomer } from "@/lib/supabase/customer";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ number: string }> };

export default async function AccountOrderPage({ params }: PageProps) {
  const { number } = await params;
  const orderNumber = decodeURIComponent(number);
  const user = await requireCustomer(`/account/orders/${encodeURIComponent(orderNumber)}`);

  const order = await getCustomerOrder(orderNumber, user.id);
  if (!order) notFound();

  return <main className="mx-auto min-h-[60vh] w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <BackButton fallbackHref="/account" />
    <div className="mt-6"><OrderSummary order={order.order} items={order.items} /></div>
  </main>;
}
