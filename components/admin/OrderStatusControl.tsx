"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatPKR } from "@/lib/catalog/format";
import { nextOrderStatus, ORDER_STATUSES, orderStatusLabel, PAYMENT_STATUS_LABELS } from "@/lib/catalog/orders";
import { updateFulfilment, updateOrderPayment, updateOrderStatus } from "@/app/admin/order-actions";
import type { OrderStatus, PaymentStatus } from "@/types";

const paymentTone: Record<PaymentStatus, string> = { unpaid: "pending", partial: "progress", paid: "done" };

export function OrderStatusControl({ orderId, status, paymentStatus, amountPaid, total, trackingNumber, adminNotes }: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  total: number;
  trackingNumber: string | null;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [amountInput, setAmountInput] = useState(Number(amountPaid) > 0 ? String(Number(amountPaid)) : "");
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => { setSelectedStatus(status); }, [status]);
  useEffect(() => { setTracking(trackingNumber ?? ""); }, [trackingNumber]);
  useEffect(() => { setNotes(adminNotes ?? ""); }, [adminNotes]);
  useEffect(() => { setAmountInput(Number(amountPaid) > 0 ? String(Number(amountPaid)) : ""); }, [amountPaid]);

  const next = nextOrderStatus(status);

  async function applyStatus(nextStatus: OrderStatus) {
    if (savingStatus || nextStatus === status) return;
    setSavingStatus(true);
    try {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (!result.ok) { showToast(result.error ?? "The status could not be updated.", "error"); setSelectedStatus(status); return; }
      setSelectedStatus(nextStatus);
      showToast(`Order marked as ${orderStatusLabel(nextStatus).toLowerCase()}.`);
      router.refresh();
    } catch {
      showToast("The status could not be updated. Please try again.", "error");
      setSelectedStatus(status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveDetails() {
    if (savingDetails) return;
    setSavingDetails(true);
    try {
      const result = await updateFulfilment(orderId, tracking, notes);
      if (!result.ok) { showToast(result.error ?? "Details could not be saved.", "error"); return; }
      showToast("Order details saved.");
      router.refresh();
    } catch {
      showToast("Details could not be saved. Please try again.", "error");
    } finally {
      setSavingDetails(false);
    }
  }

  async function savePayment(amount: number) {
    if (savingPayment) return;
    if (!Number.isFinite(amount) || amount < 0) { showToast("Enter a valid amount received.", "error"); return; }
    setSavingPayment(true);
    try {
      const result = await updateOrderPayment(orderId, amount);
      if (!result.ok) { showToast(result.error ?? "Payment could not be updated.", "error"); return; }
      showToast(amount <= 0 ? "Marked as unpaid." : amount >= Number(total) ? "Marked as paid." : "Payment recorded.");
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
        {next && <button type="button" onClick={() => applyStatus(next)} disabled={savingStatus} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50">
          {savingStatus ? <><LoaderCircle size={14} className="animate-spin" />Saving…</> : <><ChevronRight size={14} />Mark as {orderStatusLabel(next)}</>}
        </button>}
        <label className="admin-field"><span>Order status</span>
          <select value={selectedStatus} onChange={(event) => applyStatus(event.target.value as OrderStatus)} disabled={savingStatus} className="admin-select">
            {ORDER_STATUSES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
          </select>
        </label>
        <label className="admin-field"><span>Courier tracking number</span>
          <input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Optional" className="admin-input" />
        </label>
        <label className="admin-field"><span>Internal notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Not visible to the customer" className="admin-textarea" />
        </label>
        <button type="button" onClick={saveDetails} disabled={savingDetails} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#eaeaea] px-4 text-xs font-medium text-[#222] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50">
          {savingDetails ? <><LoaderCircle size={14} className="animate-spin" />Saving…</> : <><Check size={14} />Save details</>}
        </button>
      </div>
    </section>

    <section className="admin-form-section">
      <h2>Payment</h2>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-[#777]"><span className="font-medium text-[#444]">{formatPKR(amountPaid)}</span> received of {formatPKR(total)}</p>
        <span className={`status-pill ${paymentTone[paymentStatus]}`}>{PAYMENT_STATUS_LABELS[paymentStatus]}</span>
      </div>
      <div className="pay-toggle mt-3">
        <button type="button" onClick={() => savePayment(0)} disabled={savingPayment} aria-pressed={paymentStatus === "unpaid"}>Unpaid</button>
        <button type="button" className="paid" onClick={() => savePayment(Number(total))} disabled={savingPayment} aria-pressed={paymentStatus === "paid"}>Paid in full</button>
      </div>
      <div className="mt-3 grid gap-2">
        <label className="admin-field"><span>Amount received (PKR)</span>
          <input type="number" min="0" step="1" value={amountInput} onChange={(event) => setAmountInput(event.target.value)} placeholder="0" className="admin-input" />
        </label>
        <button type="button" onClick={() => savePayment(Number(amountInput || 0))} disabled={savingPayment} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#eaeaea] px-4 text-xs font-medium text-[#222] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50">
          {savingPayment ? <><LoaderCircle size={14} className="animate-spin" />Saving…</> : <><Check size={14} />Save payment</>}
        </button>
      </div>
    </section>
  </>;
}
