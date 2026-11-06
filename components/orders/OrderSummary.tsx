import Link from "next/link";
import { Truck, Wallet } from "lucide-react";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { formatDateTime, formatPKR } from "@/lib/catalog/format";
import { orderStatusLabel, orderStatusTone, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/catalog/orders";
import type { Order, OrderItem } from "@/types";

export function OrderSummary({ order, items }: { order: Order; items: OrderItem[] }) {
  const tone = orderStatusTone(order.status);

  return <div className="space-y-6">
    <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Order</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{order.order_number}</h2>
          <p className="mt-1 text-xs text-[#777]">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <span className={`status-pill ${tone}`}>{orderStatusLabel(order.status)}</span>
      </div>

      <ul className="mt-6 divide-y divide-[#f0f0f0] border-y border-[#eaeaea]">
        {items.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            {item.product_slug ? <Link href={`/products/${item.product_slug}`} className="line-clamp-2 text-sm font-medium text-[#222] hover:underline">{item.product_name}</Link> : <span className="text-sm font-medium text-[#222]">{item.product_name}</span>}
            <p className="mt-0.5 text-xs text-[#777]">{item.quantity} × {formatPKR(item.unit_price)}</p>
          </div>
          <span className="shrink-0 text-sm font-medium">{formatPKR(item.line_total)}</span>
        </li>)}
      </ul>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(order.subtotal)}</dd></div>
        <div className="flex items-center justify-between"><dt className="text-[#666]">Delivery</dt><dd className="font-medium">{Number(order.shipping_fee) === 0 ? "Free" : formatPKR(order.shipping_fee)}</dd></div>
        <div className="flex items-center justify-between border-t border-[#eaeaea] pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold">{formatPKR(order.total)}</dd></div>
      </dl>
    </section>

    <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold tracking-[-0.02em]">Order status</h3>
      <div className="mt-5"><OrderTimeline status={order.status} /></div>
      {(order.tracking_number || order.shipped_at || order.delivered_at) && <dl className="mt-5 space-y-2 border-t border-[#eaeaea] pt-4 text-xs">
        {order.tracking_number && <div className="flex items-center justify-between gap-3"><dt className="text-[#777]">Tracking number</dt><dd className="font-medium text-[#222]">{order.tracking_number}</dd></div>}
        {order.shipped_at && <div className="flex items-center justify-between gap-3"><dt className="text-[#777]">Shipped</dt><dd className="text-[#444]">{formatDateTime(order.shipped_at)}</dd></div>}
        {order.delivered_at && <div className="flex items-center justify-between gap-3"><dt className="text-[#777]">Delivered</dt><dd className="text-[#444]">{formatDateTime(order.delivered_at)}</dd></div>}
      </dl>}
    </section>

    <div className="grid gap-6 sm:grid-cols-2">
      <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold tracking-[-0.02em]">Delivery details</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div><dt className="text-xs uppercase tracking-[0.1em] text-[#888]">Name</dt><dd className="mt-0.5">{order.customer_name}</dd></div>
          <div><dt className="text-xs uppercase tracking-[0.1em] text-[#888]">Phone</dt><dd className="mt-0.5">{order.customer_phone}</dd></div>
          <div><dt className="text-xs uppercase tracking-[0.1em] text-[#888]">Address</dt><dd className="mt-0.5 whitespace-pre-line">{order.address}</dd></div>
          <div><dt className="text-xs uppercase tracking-[0.1em] text-[#888]">City</dt><dd className="mt-0.5">{order.city}</dd></div>
          {order.notes && <div><dt className="text-xs uppercase tracking-[0.1em] text-[#888]">Notes</dt><dd className="mt-0.5 whitespace-pre-line">{order.notes}</dd></div>}
        </dl>
      </section>

      <section className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold tracking-[-0.02em]">Payment</h3>
        <div className="mt-4 flex items-start gap-3">
          {order.payment_method === "cod" ? <Truck size={18} className="mt-0.5 shrink-0 text-[#555]" /> : <Wallet size={18} className="mt-0.5 shrink-0 text-[#555]" />}
          <div>
            <p className="text-sm font-medium">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
            <p className="mt-1 text-xs text-[#777]">{PAYMENT_STATUS_LABELS[order.payment_status]}</p>
            {order.payment_status === "partial" && <p className="mt-1 text-xs text-[#777]">{formatPKR(order.amount_paid)} received · {formatPKR(Number(order.total) - Number(order.amount_paid))} due</p>}
          </div>
        </div>
      </section>
    </div>
  </div>;
}
