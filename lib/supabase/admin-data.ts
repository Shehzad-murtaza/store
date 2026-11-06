import { getProducts } from "@/lib/supabase/catalog";
import { getOrderStats, getOrders } from "@/lib/supabase/order-data";
import { getReviewStats } from "@/lib/supabase/review-data";
import { createClient } from "@/lib/supabase/server";

/** Matches the storefront's "Only n left" badge. */
const LOW_STOCK_THRESHOLD = 5;

export async function getAdminOverview() {
  const supabase = await createClient();
  const [categories, products, featured, sold, recentProducts, orderStats, recentOrders, reviewStats, unpaidOrders, lowStockCount, lowStockProducts] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_sold", true),
    getProducts({ sort: "newest", limit: 6 }),
    getOrderStats(),
    getOrders(),
    getReviewStats(),
    supabase.from("orders").select("total, amount_paid").neq("status", "cancelled").neq("payment_status", "paid"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_sold", false).lte("stock_quantity", LOW_STOCK_THRESHOLD),
    supabase.from("products").select("id, name, stock_quantity, is_sold").eq("is_sold", false).lte("stock_quantity", LOW_STOCK_THRESHOLD).order("stock_quantity").limit(5),
  ]);

  for (const result of [categories, products, featured, sold, unpaidOrders, lowStockCount, lowStockProducts]) {
    if (result.error) throw new Error(`Could not load dashboard totals: ${result.error.message}`);
  }

  const unpaidRows = (unpaidOrders.data ?? []) as Array<{ total: number; amount_paid: number }>;
  const outstanding = unpaidRows.reduce((sum, row) => sum + Math.max(Number(row.total) - Number(row.amount_paid), 0), 0);

  return {
    categoryCount: categories.count ?? 0,
    productCount: products.count ?? 0,
    featuredCount: featured.count ?? 0,
    soldCount: sold.count ?? 0,
    recentProducts,
    orderCount: orderStats.orderCount,
    pendingOrders: orderStats.pendingOrders,
    revenue: orderStats.revenue,
    pendingReviews: reviewStats.pending,
    recentOrders: recentOrders.slice(0, 5),
    pendingPaymentCount: unpaidRows.length,
    outstanding,
    lowStockCount: lowStockCount.count ?? 0,
    lowStockProducts: (lowStockProducts.data ?? []) as Array<{ id: string; name: string; stock_quantity: number; is_sold: boolean }>,
  };
}
