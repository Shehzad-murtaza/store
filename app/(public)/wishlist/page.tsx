import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return <main className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
    <header className="mb-6 sm:mb-8">
      <div className="mb-4"><BackButton fallbackHref="/products" /></div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Saved for later</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Wishlist</h1>
    </header>
    <WishlistView />
  </main>;
}
