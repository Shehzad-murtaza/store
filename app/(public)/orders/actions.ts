"use server";

import { lookupOrder } from "@/lib/supabase/orders-public";
import type { PublicOrder } from "@/lib/supabase/orders-public";

export async function findPublicOrder(orderNumber: string, phone: string): Promise<{
  order: PublicOrder | null;
  error: string | null;
}> {
  try {
    const order = await lookupOrder(orderNumber, phone);
    return { order, error: order ? null : "We could not find an order with that number and phone. Check both details and try again." };
  } catch (error) {
    console.error("Public order lookup failed:", error);
    return { order: null, error: "We could not verify those details. Please try again." };
  }
}
