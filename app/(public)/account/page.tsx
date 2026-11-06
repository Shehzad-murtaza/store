import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LogOut, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/catalog/EmptyState";
import { signOutAction } from "@/app/(public)/account/actions";
import { getCustomerOrders, requireCustomer } from "@/lib/supabase/customer";
import { formatDateTime, formatPKR } from "@/lib/catalog/format";
import { orderStatusLabel, orderStatusTone } from "@/lib/catalog/orders";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCustomer();
  const orders = await getCustomerOrders();

  return <main className="mx-auto min-h-[60vh] w-full max-w-[840px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">My orders</h1>
        <p className="mt-1 text-sm text-[#666]">{user.email}</p>
      </div>
      <form action={signOutAction}>
        <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] px-4 text-sm text-[#444] transition-colors hover:bg-[#fafafa]"><LogOut size={15} />Sign out</button>
      </form>
    </header>

    <section className="mt-8">
      {orders.length
        ? <ul className="grid gap-3">{orders.map((order) => <li key={order.id}>
          <Link href={`/account/orders/${encodeURIComponent(order.order_number)}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition hover:shadow-md sm:gap-4 sm:p-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-[#eaeaea] bg-[#f3f3f2] text-[#888]"><ReceiptText size={18} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#222]">{order.order_number}</div>
              <div className="mt-1 truncate text-xs text-[#777]">{formatDateTime(order.created_at)} · {order.item_count} {order.item_count === 1 ? "item" : "items"}</div>
            </div>
            <div className="text-right"><div className="text-sm font-medium">{formatPKR(order.total)}</div><span className={`status-pill mt-1 ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></div>
            <ArrowRight size={15} className="shrink-0 text-[#888]" />
          </Link>
        </li>)}</ul>
        : <EmptyState title="No orders yet" description="Orders you place while signed in will appear here. Guest orders can be tracked with your order number and phone." actionHref="/products" actionLabel="Start shopping" />}
    </section>
  </main>;
}
