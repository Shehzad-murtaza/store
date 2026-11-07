import type { Metadata } from "next";
import CartView from "@/components/cart/CartView"; // Fixed to default import
import { BackButton } from "@/components/layout/PublicBackButton";
import { getDefaultDeliveryFee } from "@/lib/supabase/delivery";

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const defaultDeliveryFee = await getDefaultDeliveryFee();
  return (
    <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <div className="mb-4"><BackButton fallbackHref="/products" /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Your selection</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Shopping cart</h1>
      </header>
      <CartView defaultDeliveryFee={defaultDeliveryFee} />
    </main>
  );
}
