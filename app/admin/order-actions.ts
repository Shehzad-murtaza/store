"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, paymentStatusFromAmount } from "@/lib/catalog/orders";
import type { AdminActionResult } from "@/app/admin/actions";
import type { OrderStatus } from "@/types";

function revalidateOrders(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.some((entry) => entry.value === status)) return { ok: false, error: "Unknown order status." };

  const supabase = await createClient();
  const { data: current, error: loadError } = await supabase
    .from("orders").select("shipped_at, delivered_at").eq("id", orderId).maybeSingle();
  if (loadError) return { ok: false, error: loadError.message };
  if (!current) return { ok: false, error: "This order no longer exists." };

  const now = new Date().toISOString();
  const isShipped = status === "shipped" || status === "delivered";
  const shippedAt = isShipped ? current.shipped_at ?? now : null;
  const deliveredAt = status === "delivered" ? current.delivered_at ?? now : null;

  const { error } = await supabase.from("orders").update({ status, shipped_at: shippedAt, delivered_at: deliveredAt }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidateOrders(orderId);
  return { ok: true };
}

export async function updateOrderPayment(orderId: string, amountPaid: number): Promise<AdminActionResult> {
  await requireAdmin();
  if (!Number.isFinite(amountPaid) || amountPaid < 0) return { ok: false, error: "Enter a valid amount received." };

  const supabase = await createClient();
  const { data: order, error: loadError } = await supabase.from("orders").select("total").eq("id", orderId).maybeSingle();
  if (loadError) return { ok: false, error: loadError.message };
  if (!order) return { ok: false, error: "This order no longer exists." };

  const total = Number(order.total);
  const rounded = Math.min(Math.round(amountPaid * 100) / 100, total);
  const paymentStatus = paymentStatusFromAmount(total, rounded);

  const { error } = await supabase.from("orders").update({ amount_paid: rounded, payment_status: paymentStatus }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidateOrders(orderId);
  return { ok: true };
}

export async function updateFulfilment(orderId: string, trackingNumber: string, adminNotes: string): Promise<AdminActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({
    tracking_number: trackingNumber.trim() || null,
    admin_notes: adminNotes.trim() || null,
  }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidateOrders(orderId);
  return { ok: true };
}
