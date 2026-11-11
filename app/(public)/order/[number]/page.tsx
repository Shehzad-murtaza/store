import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { OrderLookupForm } from "@/components/orders/OrderLookupForm";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };

type PageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ phone?: string; placed?: string }>;
};

export default async function OrderPage({ params, searchParams }: PageProps) {
  const [{ number }, query] = await Promise.all([params, searchParams]);
  if (query.phone) redirect(`/order/${encodeURIComponent(number)}${query.placed === "1" ? "?placed=1" : ""}`);
  const safeNumber = number.slice(0, 40);
  const placed = query.placed === "1";

  return <main className="mx-auto min-h-[60vh] w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <BackButton fallbackHref="/products" />
    <div className="mx-auto mt-6 max-w-lg">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5f5f4] text-[#555]"><PackageSearch size={20} strokeWidth={1.5} /></span>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Track your order</h1>
        <p className="mt-2 text-sm leading-6 text-[#666]">Confirm the order number and phone number used at checkout to view its status.</p>
      </div>
      <OrderLookupForm
        defaultOrderNumber={safeNumber}
        placed={placed}
        className="mt-7 rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6"
      />
      <p className="mt-5 text-center text-sm text-[#777]">Just browsing? <Link href="/products" className="font-medium text-[#222] hover:underline">Continue shopping</Link></p>
    </div>
  </main>;
}
