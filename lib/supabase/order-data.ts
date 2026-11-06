import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types";

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface OrderListRow extends Order {
  item_count: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  payment?: PaymentStatus;
  search?: string;
}

export async function getOrders(filters: OrderFilters = {}): Promise<OrderListRow[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select("*, order_items(count)").order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.payment) query = query.eq("payment_status", filters.payment);

  const term = filters.search?.trim().replace(/[\\%_,()]/g, " ").replace(/\s+/g, " ").trim();
  if (term) query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load orders: ${error.message}`);

  type Row = Order & { order_items: Array<{ count: number }> };
  return ((data ?? []) as unknown as Row[]).map(({ order_items, ...order }) => ({
    ...order,
    item_count: order_items?.[0]?.count ?? 0,
  }));
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load the order: ${error.message}`);
  if (!data) return null;
  const { order_items, ...order } = data as unknown as OrderWithItems;
  return {
    ...(order as Order),
    order_items: [...(order_items ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export async function getOrderStats() {
  const supabase = await createClient();
  const [all, pending, totals] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total").neq("status", "cancelled"),
  ]);

  for (const result of [all, pending, totals]) {
    if (result.error) throw new Error(`Could not load order totals: ${result.error.message}`);
  }

  const revenue = ((totals.data ?? []) as Array<{ total: number }>).reduce((sum, row) => sum + Number(row.total), 0);

  return { orderCount: all.count ?? 0, pendingOrders: pending.count ?? 0, revenue };
}
