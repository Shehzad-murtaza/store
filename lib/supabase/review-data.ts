import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewStatus } from "@/types";

export interface ReviewWithProduct extends Review {
  product: { name: string; slug: string } | null;
}

export interface ReviewFilters {
  status?: ReviewStatus | "all";
  searchTerm?: string;
}

/** All reviews for admin moderation, newest first. */
export async function getAdminReviews(filters: ReviewFilters = {}): Promise<ReviewWithProduct[]> {
  const supabase = await createClient();
  let query = supabase.from("reviews").select("*, product:products(name, slug)").order("created_at", { ascending: false });
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load reviews: ${error.message}`);

  const reviews = (data ?? []) as unknown as ReviewWithProduct[];
  const term = filters.searchTerm?.trim().toLowerCase();
  if (!term) return reviews;
  return reviews.filter((review) => `${review.customer_name} ${review.product?.name ?? ""} ${review.comment ?? ""}`.toLowerCase().includes(term));
}

export async function getReviewStats(): Promise<{ pending: number; approved: number; rejected: number }> {
  const supabase = await createClient();
  const [pending, approved, rejected] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  for (const result of [pending, approved, rejected]) {
    if (result.error) throw new Error(`Could not load review totals: ${result.error.message}`);
  }

  return { pending: pending.count ?? 0, approved: approved.count ?? 0, rejected: rejected.count ?? 0 };
}
