import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/orders/OrderLookupForm";

export const metadata: Metadata = { title: "Track your order", robots: { index: false, follow: false } };

export default function OrdersPage() {
  return <main className="mx-auto min-h-[60vh] w-full max-w-[560px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
    <header className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Order tracking</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Find your order</h1>
      <p className="mt-3 text-sm leading-6 text-[#666]">Enter the order number you received and the phone number used at checkout.</p>
    </header>
    <div className="mt-7 rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-7">
      <OrderLookupForm />
    </div>
  </main>;
}
