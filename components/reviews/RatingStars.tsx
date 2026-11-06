import { Star } from "lucide-react";

/** Read-only star rating. Rounds to the nearest whole star for a clean, muted look. */
export function RatingStars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(Number(value) || 0);
  return <span className={className ? `rating-stars ${className}` : "rating-stars"} role="img" aria-label={`${(Number(value) || 0).toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} strokeWidth={1.6} aria-hidden="true" className={star <= rounded ? "rating-star-filled" : "rating-star-empty"} />)}
  </span>;
}
