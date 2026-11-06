import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { EmptyState } from "@/components/catalog/EmptyState";
import { formatDateTime, formatPKR } from "@/lib/catalog/format";
import { ORDER_STATUSES, orderStatusLabel, orderStatusTone, PAYMENT_STATUS_LABELS } from "@/lib/catalog/orders";
import { getOrders } from "@/lib/supabase/order-data";
import type { OrderStatus, PaymentStatus } from "@/types";

export const metadata: Metadata = { title: "Orders · Admin" };

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = await searchParams;
  const query = first(search.q).trim();
  const status = first(search.status);
  const payment = first(search.payment);

  const statusFilter = ORDER_STATUSES.some((entry) => entry.value === status) ? (status as OrderStatus) : undefined;
  const paymentFilter = payment === "paid" || payment === "unpaid" ? (payment as PaymentStatus) : undefined;

  const orders = await getOrders({ status: statusFilter, payment: paymentFilter, search: query || undefined });
  const hasFilters = Boolean(query || statusFilter || paymentFilter);

  return <main className="admin-content admin-orders-page">
    <header className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Sales</div>
      <h1 className="!my-0">Orders</h1>
      <p className="!mt-2 text-sm text-[#666]">Review incoming orders, update fulfilment, and track payment.</p>
    </header>
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form action="/admin/orders" method="get" className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search orders</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" /><input name="q" defaultValue={query} placeholder="Search order number, name, or phone" className="admin-input admin-search-input h-10" /></label>
        <label className="shrink-0"><span className="sr-only">Filter by status</span><select name="status" defaultValue={status} className="admin-select h-10 w-[170px]"><option value="">All statuses</option>{ORDER_STATUSES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select></label>
        <label className="shrink-0"><span className="sr-only">Filter by payment</span><select name="payment" defaultValue={payment} className="admin-select h-10 w-[150px]"><option value="">All payments</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></label>
        <button type="submit" className="h-10 shrink-0 rounded-lg bg-[#1a1a1a] px-3 text-xs font-medium text-white transition-colors hover:bg-[#333]">Filter</button>
      </form>
      <span className="shrink-0 whitespace-nowrap text-sm text-neutral-500">{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
    </div>

    {orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>
      {orders.map((order) => <tr key={order.id}>
        <td><Link href={`/admin/orders/${order.id}`} className="font-medium text-[#222] hover:underline">{order.order_number}</Link><div className="mt-1 text-[10px] text-[#888]">{formatDateTime(order.created_at)}</div></td>
        <td><div className="max-w-52 truncate font-medium text-[#222]">{order.customer_name}</div><div className="mt-1 text-[10px] text-[#888]">{order.customer_phone}</div></td>
        <td>{order.item_count}</td>
        <td className="whitespace-nowrap font-medium">{formatPKR(order.total)}</td>
        <td><div className="whitespace-nowrap text-xs text-[#555]">{order.payment_method === "cod" ? "Cash on delivery" : "Bank transfer"}</div><span className={`admin-status mt-1 ${order.payment_status === "paid" ? "available" : "sold"}`}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span></td>
        <td><span className={`status-pill ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></td>
        <td><div className="flex justify-end"><Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaeaea] px-3 py-2 text-xs font-medium hover:bg-[#f7f7f7]">View <ArrowRight size={13} /></Link></div></td>
      </tr>)}
    </tbody></table></div> : hasFilters
      ? <EmptyState title="No orders match these filters" description="Try changing the search or filters to see more orders." actionHref="/admin/orders" actionLabel="Clear filters" />
      : <EmptyState title="No orders yet" description="New orders from your storefront will appear here." actionHref="/admin/products" actionLabel="Manage products" />}
  </main>;
}
