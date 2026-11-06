"use client";

import { useState } from "react";
import { CircleCheck, LoaderCircle, PenLine, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { submitReview } from "@/app/(public)/review-actions";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (done) {
    return <div role="status" className="review-form-done">
      <CircleCheck size={17} className="shrink-0" />
      <p>Thanks! Your review is pending and will appear once approved.</p>
    </div>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Enter the order number and the phone you used at checkout.");
      return;
    }
    if (!rating) {
      setError("Choose a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitReview({ orderNumber, phone, productId, rating, comment });
      if (!result.ok) {
        setError(result.error ?? "Your review could not be submitted. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Your review could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#deded6] bg-white px-5 text-sm font-medium text-[#272a24] transition-colors hover:bg-[#f5f4ef]">
      <PenLine size={15} />Write a review
    </button>;
  }

  return <form onSubmit={handleSubmit} noValidate className="review-form">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-sm font-semibold tracking-[-0.02em]">Review {productName}</h3>
      <button type="button" onClick={() => setOpen(false)} disabled={busy} className="text-xs text-[#777] hover:text-black">Cancel</button>
    </div>
    <p className="mt-1.5 text-xs leading-5 text-[#777]">Reviews are verified against a real order before publishing.</p>

    <div className="mt-4 grid gap-4">
      <label className="contact-field"><span>Order number</span><Input required maxLength={40} value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); setError(""); }} placeholder="ORD-1001" className="contact-input" /></label>
      <label className="contact-field"><span>Phone used at checkout</span><Input type="tel" required maxLength={40} value={phone} onChange={(event) => { setPhone(event.target.value); setError(""); }} placeholder="03XX-XXXXXXX" className="contact-input" /></label>

      <div className="contact-field">
        <span>Your rating</span>
        <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hover || rating);
            return <button key={star} type="button" onClick={() => { setRating(star); setError(""); }} onMouseEnter={() => setHover(star)} aria-label={`${star} star${star > 1 ? "s" : ""}`} aria-pressed={star <= rating} className={`rating-pick ${active ? "is-active" : ""}`}>
              <Star size={22} strokeWidth={1.6} className={active ? "fill-current" : undefined} />
            </button>;
          })}
          {(hover || rating) > 0 && <span className="ml-1 text-xs text-[#666]">{RATING_LABELS[hover || rating]}</span>}
        </div>
      </div>

      <label className="contact-field"><span>Your review <small>optional</small></span><textarea required={false} maxLength={1000} rows={4} value={comment} onChange={(event) => { setComment(event.target.value); setError(""); }} placeholder="What did you like about this product?" className="contact-input resize-y py-3" /></label>
    </div>

    {error && <p className="field-error mt-3" role="alert">{error}</p>}

    <button type="submit" disabled={busy} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
      {busy ? <><LoaderCircle size={15} className="animate-spin" />Submitting…</> : "Submit review"}
    </button>
  </form>;
}
