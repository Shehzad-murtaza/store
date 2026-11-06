import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { Review } from "@/types";

/** Approved reviews for a product, newest first. */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, order_id, customer_name, rating, comment, status, created_at, updated_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load reviews: ${error.message}`);
  return (data ?? []) as Review[];
}
