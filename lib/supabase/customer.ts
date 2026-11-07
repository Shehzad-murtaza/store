import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types";

export interface CustomerOrderRow extends Order {
  item_count: number;
}

export interface CustomerOrder {
  order: Order;
  items: OrderItem[];
}

/** The signed-in storefront customer, or null for guests. */
export async function getCurrentCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Redirects guests to the sign-in page, returning the customer when signed in. */
export async function requireCustomer(nextPath = "/account") {
  const user = await getCurrentCustomer();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(nextPath)}`);

  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (!error && isAdmin) redirect("/admin");

  return user;
}

/** Orders placed by the signed-in customer, newest first. RLS limits this to their own. */
export async function getCustomerOrders(userId: string): Promise<CustomerOrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load your orders: ${error.message}`);

  type Row = Order & { order_items: Array<{ count: number }> };
  return ((data ?? []) as unknown as Row[]).map(({ order_items, ...order }) => ({
    ...order,
    item_count: order_items?.[0]?.count ?? 0,
  }));
}

/** A single order owned by the signed-in customer, with its items. */
export async function getCustomerOrder(orderNumber: string, userId: string): Promise<CustomerOrder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not load your order: ${error.message}`);
  if (!data) return null;

  const { order_items, ...order } = data as unknown as Order & { order_items: OrderItem[] };
  return {
    order: order as Order,
    items: [...(order_items ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
  };
}
