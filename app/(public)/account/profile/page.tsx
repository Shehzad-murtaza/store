import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, PackageCheck, UserRound } from "lucide-react";
import { CustomerProfileOverview } from "@/components/account/CustomerProfileOverview";
import { signOutAction } from "@/app/(public)/account/actions";
import { getCustomerOrders, requireCustomer } from "@/lib/supabase/customer";
import { formatDateTime } from "@/lib/catalog/format";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Your profile", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const user = await requireCustomer("/account/profile");
  let ordersCount = 0;
  try {
    ordersCount = (await getCustomerOrders(user.id)).length;
  } catch (error) {
    console.error("Could not load account order summary:", error);
  }

  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;

  return <main className="mx-auto min-h-[60vh] w-full max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div className="mb-4"><BackButton fallbackHref="/" /></div>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Your account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Profile</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#666]">Your details and everything you have saved with SHEZY.</p>
      </div>
      <form action={signOutAction}>
        <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] px-4 text-sm text-[#444] transition-colors hover:bg-[#fafafa]"><LogOut size={15} />Sign out</button>
      </form>
    </header>

    <section aria-label="Profile information" className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f3f3f1] text-[#555]"><UserRound size={20} strokeWidth={1.6} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{fullName ?? user.email ?? "SHEZY customer"}</p>
        {fullName && user.email && <p className="mt-1 truncate text-sm text-[#666]">{user.email}</p>}
        {phone && <p className="mt-1 text-sm text-[#666]">{phone}</p>}
        <p className="mt-1 text-xs text-[#888]">Member since {formatDateTime(user.created_at)}</p>
      </div>
      <Link href="/account" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#eaeaea] px-3 text-xs font-medium text-[#444] transition-colors hover:bg-[#f7f7f7]"><PackageCheck size={15} />{ordersCount} {ordersCount === 1 ? "order" : "orders"}</Link>
    </section>

    <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Your shopping</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Saved items</h2></div>
      <Link href="/account" className="text-sm font-medium text-[#555] transition-colors hover:text-black">View order history</Link>
    </div>
    <CustomerProfileOverview />
  </main>;
}
