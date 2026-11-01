import { createClient } from "@/lib/supabase/server";
import type { Category, Product, ProductImage } from "@/types";

export interface CategoryWithCount extends Category {
  product_count: number;
}

export interface ProductWithCatalogData extends Product {
  product_images: ProductImage[];
  category: Pick<Category, "id" | "name" | "slug"> | null;
  primary_image_url: string | null;
}

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock" | "sold";
  featuredOnly?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
  excludeId?: string;
  limit?: number;
}

type ProductRow = Product & {
  product_images: ProductImage[];
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

function mapProduct(row: ProductRow): ProductWithCatalogData {
  const images = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return {
    ...row,
    product_images: images,
    category: row.category ?? null,
    primary_image_url: images[0]?.image_url ?? null,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();
  const { data: categories, error: categoryError } = await supabase.from("categories").select("*").order("name");

  if (categoryError) throw new Error(`Could not load categories: ${categoryError.message}`);
  return Promise.all(((categories ?? []) as Category[]).map(async (category) => {
    const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", category.id);
    if (error) throw new Error(`Could not load product count for ${category.name}: ${error.message}`);
    return { ...category, product_count: count ?? 0 };
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Could not load category: ${error.message}`);
  return (data as Category | null) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load category: ${error.message}`);
  return (data as Category | null) ?? null;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithCatalogData[]> {
  const supabase = await createClient();

  let categoryId = filters.categoryId;
  if (!categoryId && filters.categorySlug) {
    const category = await getCategoryBySlug(filters.categorySlug);
    if (!category) return [];
    categoryId = category.id;
  }

  let query = supabase.from("products").select("*, product_images(*), category:categories(id, name, slug)");
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.availability === "in_stock") query = query.eq("is_sold", false);
  if (filters.availability === "sold") query = query.eq("is_sold", true);
  if (filters.featuredOnly) query = query.eq("is_featured", true);
  if (filters.excludeId) query = query.neq("id", filters.excludeId);

  // Price filters use the amount customers pay when a discount is active.
  if (filters.minPrice !== undefined) {
    const value = filters.minPrice.toFixed(2);
    query = query.or(`discount_price.gte.${value},and(discount_price.is.null,price.gte.${value})`);
  }
  if (filters.maxPrice !== undefined) {
    const value = filters.maxPrice.toFixed(2);
    query = query.or(`discount_price.lte.${value},and(discount_price.is.null,price.lte.${value})`);
  }

  if (filters.sort !== "price-asc" && filters.sort !== "price-desc") {
    query = query.order("created_at", { ascending: false });
  }
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load products: ${error.message}`);

  const products = ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
  if (filters.sort === "price-asc") {
    products.sort((a, b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price));
  } else if (filters.sort === "price-desc") {
    products.sort((a, b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price));
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<ProductWithCatalogData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*, product_images(*), category:categories(id, name, slug)").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  return mapProduct(data as unknown as ProductRow);
}

export async function getProductById(id: string): Promise<ProductWithCatalogData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*, product_images(*), category:categories(id, name, slug)").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  return mapProduct(data as unknown as ProductRow);
}
