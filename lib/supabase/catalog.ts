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
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock" | "sold";
  featuredOnly?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
  excludeId?: string;
  limit?: number;
}

type ProductRow = Product & { product_images: ProductImage[] };

function mapProduct(row: ProductRow, categoryMap: Map<string, Category>): ProductWithCatalogData {
  const images = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const category = row.category_id ? categoryMap.get(row.category_id) : undefined;

  return {
    ...row,
    product_images: images,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
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
  const [{ data: categories, error: categoryError }, { data: productRows, error: productError }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  if (categoryError) throw new Error(`Could not load categories: ${categoryError.message}`);
  if (productError) throw new Error(`Could not load category counts: ${productError.message}`);

  const counts = new Map<string, number>();
  for (const row of productRows ?? []) {
    if (row.category_id) counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return ((categories ?? []) as Category[]).map((category) => ({
    ...category,
    product_count: counts.get(category.id) ?? 0,
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
  const categories = await getCategories();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const category = categories.find((item) => item.slug === filters.categorySlug);
    if (!category) return [];
    categoryId = category.id;
  }

  let query = supabase.from("products").select("*, product_images(*)");
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

  const products = ((data ?? []) as unknown as ProductRow[]).map((product) => mapProduct(product, categoryMap));
  if (filters.sort === "price-asc") {
    products.sort((a, b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price));
  } else if (filters.sort === "price-desc") {
    products.sort((a, b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price));
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<ProductWithCatalogData | null> {
  const supabase = await createClient();
  const [{ data, error }, categories] = await Promise.all([
    supabase.from("products").select("*, product_images(*)").eq("slug", slug).maybeSingle(),
    getCategories(),
  ]);
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return mapProduct(data as unknown as ProductRow, categoryMap);
}

export async function getProductById(id: string): Promise<ProductWithCatalogData | null> {
  const supabase = await createClient();
  const [{ data, error }, categories] = await Promise.all([
    supabase.from("products").select("*, product_images(*)").eq("id", id).maybeSingle(),
    getCategories(),
  ]);
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return mapProduct(data as unknown as ProductRow, categoryMap);
}
