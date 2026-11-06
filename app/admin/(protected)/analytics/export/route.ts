import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { parseRange, rangeStart } from "@/lib/supabase/analytics";
import { createClient } from "@/lib/supabase/server";
import { orderStatusLabel, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/catalog/orders";
import type { Order } from "@/types";

type ExportRow = Order & { order_items: Array<{ count: number }> };

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  await requireAdmin();

  const range = parseRange(new URL(request.url).searchParams.get("range") ?? undefined);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .gte("created_at", rangeStart(range).toISOString())
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = ["Order", "Date", "Customer", "Phone", "City", "Items", "Payment method", "Payment status", "Amount paid", "Order status", "Subtotal", "Shipping", "Total", "Balance"];
  const rows = ((data ?? []) as unknown as ExportRow[]).map(({ order_items, ...order }) => [
    order.order_number,
    new Date(order.created_at).toISOString(),
    order.customer_name,
    order.customer_phone,
    order.city,
    order_items?.[0]?.count ?? 0,
    PAYMENT_METHOD_LABELS[order.payment_method],
    PAYMENT_STATUS_LABELS[order.payment_status],
    Number(order.amount_paid),
    orderStatusLabel(order.status),
    order.subtotal,
    order.shipping_fee,
    order.total,
    Math.max(Number(order.total) - Number(order.amount_paid), 0),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shezy-orders-${range.key}-${stamp}.csv"`,
    },
  });
}
