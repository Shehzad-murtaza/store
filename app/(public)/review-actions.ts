"use server";

import { createPublicClient } from "@/lib/supabase/public";

export interface SubmitReviewInput {
  orderNumber: string;
  phone: string;
  productId: string;
  rating: number;
  comment: string;
}

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

/** Submits a verified-purchase review. The row starts as pending until an admin approves it. */
export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const orderNumber = input.orderNumber.trim();
  const phone = input.phone.trim();
  const comment = input.comment.trim();

  if (!orderNumber) return { ok: false, error: "Enter the order number from your confirmation." };
  if (orderNumber.length > 40) return { ok: false, error: "That order number looks too long." };
  if (!phone) return { ok: false, error: "Enter the phone number you used at checkout." };
  if (phone.length > 40) return { ok: false, error: "That phone number looks too long." };
  if (!input.productId) return { ok: false, error: "This product could not be identified." };
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) return { ok: false, error: "Choose a rating between 1 and 5 stars." };
  if (comment.length > 1000) return { ok: false, error: "Please keep your review under 1000 characters." };

  const supabase = createPublicClient();
  const { error } = await supabase.rpc("submit_review", {
    p_order_number: orderNumber,
    p_phone: phone,
    p_product_id: input.productId,
    p_rating: input.rating,
    p_comment: comment || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
