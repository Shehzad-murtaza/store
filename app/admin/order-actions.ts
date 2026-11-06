"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/catalog/orders";
import type { AdminActionResult } from "@/app/admin/actions";
import type { OrderStatus, PaymentStatus } from "@/types";

function revalidateOrders(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.some((entry) => entry.value === status)) return { ok: false, error: "Unknown order status." };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidateOrders(orderId);
  return { ok: true };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<AdminActionResult> {
  await requireAdmin();
  if (paymentStatus !== "unpaid" && paymentStatus !== "paid") return { ok: false, error: "Unknown payment status." };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidateOrders(orderId);
  return { ok: true };
}
