import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { OrderItem, TrackedOrder } from "@/types";

export interface PublicOrder {
  order: TrackedOrder;
  items: OrderItem[];
}

function isValidPakistaniPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return (digits.length === 11 && digits.startsWith("03"))
    || (digits.length === 12 && digits.startsWith("923"));
}

/** Reads a single order by matching its number and a complete Pakistani phone number. */
export async function lookupOrder(orderNumber: string, phone: string): Promise<PublicOrder | null> {
  const number = orderNumber.trim();
  const phoneValue = phone.trim();
  if (!number || number.length > 40 || !isValidPakistaniPhone(phoneValue)) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("lookup_order", { p_order_number: number, p_phone: phoneValue });
  if (error) throw new Error(`Could not load the order: ${error.message}`);
  if (!data) return null;

  return data as PublicOrder;
}
