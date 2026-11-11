import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatDateTime, formatPKR } from "@/lib/catalog/format";
import { orderStatusLabel, orderStatusTone, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, toWhatsAppNumber } from "@/lib/catalog/orders";
import { getOrderById } from "@/lib/supabase/order-data";
import { SITE_NAME } from "@/lib/site";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  return { title: order ? `${order.order_number} · Orders` : "Order · Admin" };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const whatsappHref = `https://wa.me/${toWhatsAppNumber(order.customer_phone)}?text=${encodeURIComponent(`Hello ${order.customer_name}, this is ${SITE_NAME} regarding your order ${order.order_number}.`)}`;

  return <main className="admin-content admin-order-detail">
    <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-black"><ArrowLeft size={14} />Back to orders</Link>
      <PrintButton />
    </div>

    <header className="no-print mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Order</div>
        <h1 className="!my-0">{order.order_number}</h1>
        <p className="!mt-1 text-sm text-[#666]">Placed {formatDateTime(order.created_at)}</p>
      </div>
      <span className={`status-pill ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</span>
    </header>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
      <div id="invoice" className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eaeaea] pb-5">
          <div>
            <p className="text-base font-semibold tracking-[-0.02em]">{SITE_NAME}</p>
            <p className="mt-1 text-xs text-[#777]">Order {order.order_number}</p>
          </div>
          <span className={`status-pill ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</span>
        </div>

        <div className="grid gap-5 py-5 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#888]">Customer</h3>
            <p className="mt-2 text-sm font-medium">{order.customer_name}</p>
            <p className="mt-0.5 text-sm text-[#666]">{order.customer_phone}</p>
            {order.customer_email && <p className="mt-0.5 text-sm text-[#666]">{order.customer_email}</p>}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#888]">Deliver to</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-[#666]">{order.address}</p>
            <p className="mt-0.5 text-sm text-[#666]">{order.city}</p>
          </div>
        </div>

        {order.notes && <p className="mb-5 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3 text-xs leading-5 text-[#666]"><span className="font-medium text-[#444]">Notes:</span> {order.notes}</p>}

        <div className="overflow-x-auto">
          <table className="admin-table admin-order-items">
            <thead><tr><th>Item</th><th>Unit price</th><th>Qty</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {order.order_items.map((item) => <tr key={item.id}>
                <td data-label="Item"><div className="font-medium text-[#222]">{item.product_name}</div>{item.product_slug && <div className="mt-0.5 text-[10px] text-[#888]">{item.product_slug}</div>}</td>
                <td data-label="Unit price" className="whitespace-nowrap">{formatPKR(item.unit_price)}</td>
                <td data-label="Qty">{item.quantity}</td>
                <td data-label="Total" className="whitespace-nowrap text-right font-medium">{formatPKR(item.line_total)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex items-center justify-between"><dt className="text-[#666]">Subtotal</dt><dd className="font-medium">{formatPKR(order.subtotal)}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-[#666]">Delivery</dt><dd className="font-medium">{Number(order.shipping_fee) === 0 ? "Free" : formatPKR(order.shipping_fee)}</dd></div>
          <div className="flex items-center justify-between border-t border-[#eaeaea] pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold">{formatPKR(order.total)}</dd></div>
          <div className="flex items-center justify-between text-xs"><dt className="text-[#666]">{PAYMENT_METHOD_LABELS[order.payment_method]}</dt><dd className="text-[#666]">{PAYMENT_STATUS_LABELS[order.payment_status]}</dd></div>
          {Number(order.amount_paid) > 0 && <div className="flex items-center justify-between text-xs"><dt className="text-[#666]">Received</dt><dd className="text-[#666]">{formatPKR(order.amount_paid)}</dd></div>}
          {order.tracking_number && <div className="flex items-center justify-between text-xs"><dt className="text-[#666]">Tracking</dt><dd className="text-[#666]">{order.tracking_number}</dd></div>}
        </dl>
      </div>

      <div className="no-print space-y-6">
        <OrderStatusControl
          orderId={order.id}
          status={order.status}
          paymentStatus={order.payment_status}
          amountPaid={Number(order.amount_paid)}
          total={Number(order.total)}
          trackingNumber={order.tracking_number}
          adminNotes={order.admin_notes}
        />
        <section className="admin-form-section">
          <h2>Contact customer</h2>
          <p className="mt-2 text-xs leading-5 text-[#777]">Continue this order on WhatsApp to confirm and deliver it manually.</p>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#333]"><MessageCircle size={16} />Message on WhatsApp</a>
        </section>
      </div>
    </div>
  </main>;
}
