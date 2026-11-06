import { RatingStars } from "@/components/reviews/RatingStars";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { formatDateTime } from "@/lib/catalog/format";
import type { Review } from "@/types";

export function ProductReviews({ productId, productName, ratingAverage, ratingCount, reviews }: {
  productId: string;
  productName: string;
  ratingAverage: number;
  ratingCount: number;
  reviews: Review[];
}) {
  const average = Number(ratingAverage) || 0;

  return <section aria-labelledby="reviews-heading" className="mt-12 border-t border-[#eaeaea] pt-8 sm:mt-16 sm:pt-10">
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Reviews</p>
        <h2 id="reviews-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Customer feedback</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-semibold tracking-[-0.04em]">{ratingCount ? average.toFixed(1) : "—"}</span>
          <div>
            <RatingStars value={average} size={16} />
            <p className="mt-1 text-xs text-[#777]">{ratingCount ? `${ratingCount} verified ${ratingCount === 1 ? "review" : "reviews"}` : "No reviews yet"}</p>
          </div>
        </div>
        <div className="mt-5"><ReviewForm productId={productId} productName={productName} /></div>
      </div>

      {reviews.length
        ? <ul className="space-y-5">{reviews.map((review) => <li key={review.id} className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f2f2f0] text-xs font-semibold text-[#555]">{review.customer_name.trim().charAt(0).toUpperCase() || "?"}</span>
              <div>
                <p className="text-sm font-medium text-[#222]">{review.customer_name}</p>
                <p className="text-[11px] text-[#888]">Verified purchase · {formatDateTime(review.created_at)}</p>
              </div>
            </div>
            <RatingStars value={review.rating} size={13} />
          </div>
          {review.comment && <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[#555]">{review.comment}</p>}
        </li>)}</ul>
        : <div className="rounded-xl border border-dashed border-[#dedede] bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#666]">Be the first to share your experience with this product.</p>
        </div>}
    </div>
  </section>;
}
