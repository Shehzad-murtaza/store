import { getProducts } from "@/lib/supabase/catalog";
import { createClient } from "@/lib/supabase/server";

export async function getAdminOverview() {
  const supabase = await createClient();
  const [categories, products, featured, sold, recentProducts] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_sold", true),
    getProducts({ sort: "newest", limit: 6 }),
  ]);

  for (const result of [categories, products, featured, sold]) {
    if (result.error) throw new Error(`Could not load dashboard totals: ${result.error.message}`);
  }

  return {
    categoryCount: categories.count ?? 0,
    productCount: products.count ?? 0,
    featuredCount: featured.count ?? 0,
    soldCount: sold.count ?? 0,
    recentProducts,
  };
}
