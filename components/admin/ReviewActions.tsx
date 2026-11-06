"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, RotateCcw, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { deleteReview, setReviewStatus } from "@/app/admin/review-actions";
import type { ReviewStatus } from "@/types";

export function ReviewActions({ reviewId, status }: { reviewId: string; status: ReviewStatus }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function update(next: ReviewStatus) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await setReviewStatus(reviewId, next);
      if (!result.ok) {
        showToast(result.error ?? "The review could not be updated.", "error");
        return;
      }
      showToast(next === "approved" ? "Review approved." : next === "rejected" ? "Review rejected." : "Review moved back to pending.");
      router.refresh();
    } catch {
      showToast("The review could not be updated. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  const base = "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:opacity-50";

  return <div className="flex flex-wrap justify-end gap-1.5">
    {status !== "approved" && <button type="button" onClick={() => update("approved")} disabled={busy} className={`${base} border-[#cfe0d2] text-[#3d5c43] hover:bg-[#f2f7f2]`}>{busy ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}Approve</button>}
    {status !== "rejected" && <button type="button" onClick={() => update("rejected")} disabled={busy} className={`${base} border-[#e4c4c1] text-[#7c3732] hover:bg-[#fff7f6]`}><X size={13} />Reject</button>}
    {status !== "pending" && <button type="button" onClick={() => update("pending")} disabled={busy} className={`${base} border-[#eaeaea] text-[#555] hover:bg-[#f7f7f7]`}><RotateCcw size={13} />Restore</button>}
    <ConfirmDialog title="Delete this review?" description="The review will be permanently removed and the product rating recalculated." action={deleteReview} actionId={reviewId} compact />
  </div>;
}
