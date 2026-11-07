import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

export async function getDefaultDeliveryFee(): Promise<number> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("default_delivery_fee")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Could not load delivery settings:", error.message);
    return 0;
  }
  return Number(data?.default_delivery_fee ?? 0);
}
