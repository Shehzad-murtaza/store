import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { Order, OrderItem } from "@/types";

export interface PublicOrder {
  order: Order;
  items: OrderItem[];
}

/** Reads a single order as a guest by matching the order number with the phone. */
export async function lookupOrder(orderNumber: string, phone: string): Promise<PublicOrder | null> {
  const number = orderNumber.trim();
  const phoneValue = phone.trim();
  if (!number || !phoneValue) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("lookup_order", { p_order_number: number, p_phone: phoneValue });
  if (error) throw new Error(`Could not load the order: ${error.message}`);
  if (!data) return null;

  return data as PublicOrder;
}
