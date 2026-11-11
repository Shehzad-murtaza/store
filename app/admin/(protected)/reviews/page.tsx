import type { Metadata } from "next";
import Link from "next/link";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { EmptyState } from "@/components/catalog/EmptyState";
import { RatingStars } from "@/components/reviews/RatingStars";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { formatDateTime } from "@/lib/catalog/format";
import { getAdminReviews, getReviewStats } from "@/lib/supabase/review-data";
import type { ReviewStatus } from "@/types";

export const metadata: Metadata = { title: "Reviews · Admin" };
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];
const STATUS_LABELS: Record<ReviewStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const STATUS_TONES: Record<ReviewStatus, string> = { pending: "pending", approved: "done", rejected: "cancelled" };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = await searchParams;
  const query = first(search.q).trim();
  const status = first(search.status);

  const statusFilter = STATUSES.includes(status as ReviewStatus) ? (status as ReviewStatus) : undefined;
  const [reviews, stats] = await Promise.all([getAdminReviews({ status: statusFilter ?? "all", searchTerm: query || undefined }), getReviewStats()]);
  const hasFilters = Boolean(query || statusFilter);

  return <main className="admin-content admin-reviews-page">
    <header className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Trust</div>
      <h1 className="!my-0">Reviews</h1>
      <p className="!mt-2 text-sm text-[#666]">Approve verified customer reviews before they appear on the storefront.</p>
    </header>

    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      {STATUSES.map((entry) => <div key={entry} className="rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm">
        <div className="text-xs text-[#666]">{STATUS_LABELS[entry]}</div>
        <div className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{stats[entry]}</div>
      </div>)}
    </div>

    <div className="mb-4 flex flex-wrap items-center gap-3">
      <AdminSearchFilters
        searchPlaceholder="Search customer, product, or text"
        searchAriaLabel="Search reviews"
        selects={[{ name: "status", ariaLabel: "Filter by status", options: [{ value: "", label: "All statuses" }, ...STATUSES.map((entry) => ({ value: entry, label: STATUS_LABELS[entry] }))] }]}
      />
      <span className="shrink-0 whitespace-nowrap text-sm text-neutral-500">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
    </div>

    {reviews.length ? <div className="admin-table-wrap"><table className="admin-table admin-reviews-table"><thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>
      {reviews.map((review) => <tr key={review.id}>
        <td data-label="Product">{review.product ? <Link href={`/products/${review.product.slug}`} className="font-medium text-[#222] hover:underline">{review.product.name}</Link> : <span className="text-[#888]">Deleted product</span>}</td>
        <td data-label="Customer"><div className="max-w-40 truncate font-medium text-[#222]">{review.customer_name}</div><div className="mt-1 text-[10px] text-[#888]">{formatDateTime(review.created_at)}</div></td>
        <td data-label="Rating"><RatingStars value={review.rating} size={13} /></td>
        <td data-label="Review"><div className="max-w-72 whitespace-pre-line text-xs leading-5 text-[#555]">{review.comment || <span className="text-[#999]">No comment</span>}</div></td>
        <td data-label="Status"><span className={`status-pill ${STATUS_TONES[review.status]}`}>{STATUS_LABELS[review.status]}</span></td>
        <td data-label="Actions"><ReviewActions reviewId={review.id} status={review.status} /></td>
      </tr>)}
    </tbody></table></div> : hasFilters
      ? <EmptyState title="No reviews match these filters" description="Try changing the search or filters to see more reviews." actionHref="/admin/reviews" actionLabel="Clear filters" />
      : <EmptyState title="No reviews yet" description="Verified reviews submitted by customers will appear here for approval." actionHref="/admin/products" actionLabel="Manage products" />}
  </main>;
}
