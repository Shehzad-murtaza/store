"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function getDeliveryQuote(productIds: string[]): Promise<{ defaultDeliveryFee: number; productFees: Record<string, number> }> {
  const supabase = await createClient();
  const ids = [...new Set(productIds.filter(Boolean))].slice(0, 100);
  const [settingsResult, productsResult] = await Promise.all([
    supabase.from("store_settings").select("default_delivery_fee").eq("id", true).maybeSingle(),
    ids.length ? supabase.from("products").select("id, delivery_fee").in("id", ids) : Promise.resolve({ data: [] as Array<{ id: string; delivery_fee: number }>, error: null }),
  ]);
  if (settingsResult.error || (ids.length && productsResult.error)) {
    console.error("Delivery pricing is not configured in Supabase:", settingsResult.error?.message ?? productsResult.error?.message);
    throw new Error("Delivery pricing is unavailable.");
  }

  return {
    defaultDeliveryFee: Number(settingsResult.data?.default_delivery_fee ?? 0),
    productFees: Object.fromEntries((productsResult.data ?? []).map((product) => [product.id, Number(product.delivery_fee ?? 0)])),
  };
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
  const productIds = [...new Set(items.map(({ product_id }) => product_id))];
  const [settingsCheck, productFeesCheck] = await Promise.all([
    supabase.from("store_settings").select("id").eq("id", true).maybeSingle(),
    supabase.from("products").select("id, delivery_fee").in("id", productIds),
  ]);
  if (settingsCheck.error || productFeesCheck.error || !settingsCheck.data || (productFeesCheck.data?.length ?? 0) !== productIds.length) {
    console.error("Cannot place checkout while delivery pricing is unavailable:", settingsCheck.error?.message ?? productFeesCheck.error?.message ?? "Delivery settings or product pricing are missing.");
    return { ok: false, error: "We could not confirm the delivery charges. Please try again in a moment or contact us on WhatsApp." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || null,
    p_address: address,
    p_city: city,
    p_notes: notes || null,
    p_payment_method: input.paymentMethod,
    p_shipping_fee: 0,
    p_items: items,
  });

  if (error) return { ok: false, error: error.message };

  const payload = data as { order_number?: string } | null;
  if (!payload?.order_number) return { ok: false, error: "The order could not be placed. Please try again." };

  revalidateTag("catalog");
  return { ok: true, orderNumber: payload.order_number };
}
