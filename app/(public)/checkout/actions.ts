"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SHIPPING_FEE } from "@/lib/catalog/orders";

export interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: "cod" | "bank";
  items: Array<{ productId: string; quantity: number }>;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: string;
  error?: string;
}

function clean(value: string): string {
  return value.trim();
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const customerName = clean(input.customerName);
  const customerPhone = clean(input.customerPhone);
  const customerEmail = clean(input.customerEmail);
  const address = clean(input.address);
  const city = clean(input.city);
  const notes = clean(input.notes);

  if (!customerName || customerName.length > 120) return { ok: false, error: "Please enter your name (120 characters or fewer)." };
  if (!customerPhone || customerPhone.length > 40) return { ok: false, error: "Please enter a valid phone number." };
  if (customerEmail && customerEmail.length > 254) return { ok: false, error: "Please enter a valid email address." };
  if (!address || address.length > 500) return { ok: false, error: "Please enter a delivery address." };
  if (!city || city.length > 120) return { ok: false, error: "Please enter your city." };
  if (input.paymentMethod !== "cod" && input.paymentMethod !== "bank") return { ok: false, error: "Please choose a payment method." };
  if (!input.items.length) return { ok: false, error: "Your cart is empty." };

  const items = input.items
    .map((item) => ({ product_id: item.productId, quantity: Math.trunc(item.quantity) }))
    .filter((item) => item.product_id && item.quantity > 0);
  if (!items.length) return { ok: false, error: "Your cart is empty." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || null,
    p_address: address,
    p_city: city,
    p_notes: notes || null,
    p_payment_method: input.paymentMethod,
    p_shipping_fee: SHIPPING_FEE,
    p_items: items,
  });

  if (error) return { ok: false, error: error.message };

  const payload = data as { order_number?: string } | null;
  if (!payload?.order_number) return { ok: false, error: "The order could not be placed. Please try again." };

  revalidateTag("catalog");
  return { ok: true, orderNumber: payload.order_number };
}
