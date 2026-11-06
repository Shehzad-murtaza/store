"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUSES } from "@/lib/catalog/orders";
import { updateOrderStatus, updatePaymentStatus } from "@/app/admin/order-actions";
import type { OrderStatus, PaymentStatus } from "@/types";

export function OrderStatusControl({ orderId, status, paymentStatus }: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  async function saveStatus() {
    if (savingStatus || selectedStatus === status) return;
    setSavingStatus(true);
    try {
      const result = await updateOrderStatus(orderId, selectedStatus);
      if (!result.ok) { showToast(result.error ?? "The status could not be updated.", "error"); setSelectedStatus(status); return; }
      showToast("Order status updated.");
      router.refresh();
    } catch {
      showToast("The status could not be updated. Please try again.", "error");
      setSelectedStatus(status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function setPaid(next: PaymentStatus) {
    if (savingPayment || next === paymentStatus) return;
    setSavingPayment(true);
    try {
      const result = await updatePaymentStatus(orderId, next);
      if (!result.ok) { showToast(result.error ?? "Payment could not be updated.", "error"); return; }
      showToast(next === "paid" ? "Marked as paid." : "Marked as unpaid.");
      router.refresh();
    } catch {
      showToast("Payment could not be updated. Please try again.", "error");
    } finally {
      setSavingPayment(false);
    }
  }

  return <>
    <section className="admin-form-section">
      <h2>Fulfilment</h2>
      <div className="mt-4 grid gap-3">
        <label className="admin-field"><span>Order status</span>
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)} className="admin-select">
            {ORDER_STATUSES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={saveStatus} disabled={savingStatus || selectedStatus === status} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50">
          {savingStatus ? <><LoaderCircle size={14} className="animate-spin" />Saving…</> : <><Check size={14} />Update status</>}
        </button>
      </div>
    </section>

    <section className="admin-form-section">
      <h2>Payment</h2>
      <div className="mt-4 inline-flex w-full rounded-lg border border-[#eaeaea] p-1">
        <button type="button" onClick={() => setPaid("unpaid")} disabled={savingPayment} aria-pressed={paymentStatus === "unpaid"} className={`h-9 flex-1 rounded-md text-xs font-medium transition-colors ${paymentStatus === "unpaid" ? "bg-[#f1f1f1] text-[#222]" : "text-[#666] hover:bg-[#fafafa]"}`}>Unpaid</button>
        <button type="button" onClick={() => setPaid("paid")} disabled={savingPayment} aria-pressed={paymentStatus === "paid"} className={`h-9 flex-1 rounded-md text-xs font-medium transition-colors ${paymentStatus === "paid" ? "bg-[#eff4ee] text-[#46624a]" : "text-[#666] hover:bg-[#fafafa]"}`}>Paid</button>
      </div>
      {savingPayment && <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#777]"><LoaderCircle size={13} className="animate-spin" />Saving…</p>}
    </section>
  </>;
}
