"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/app/admin/actions";
import type { ReviewStatus } from "@/types";

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  // Product rating summaries are stored on products and rendered through the catalog cache.
  revalidateTag("catalog");
}

export async function setReviewStatus(reviewId: string, status: ReviewStatus): Promise<AdminActionResult> {
  await requireAdmin();
  if (status !== "pending" && status !== "approved" && status !== "rejected") return { ok: false, error: "Unknown review status." };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidateReviews();
  return { ok: true };
}

export async function deleteReview(reviewId: string): Promise<AdminActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidateReviews();
  return { ok: true };
}
