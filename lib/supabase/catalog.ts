import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Product, ProductImage } from "@/types";

export interface CategoryWithCount extends Category {
  product_count: number;
}

export interface ProductWithCatalogData extends Product {
  product_images: ProductImage[];
  category: Pick<Category, "id" | "name" | "slug"> | null;
  primary_image_url: string | null;
}

export interface ProductCardData extends Pick<Product, "id" | "name" | "slug" | "price" | "discount_price" | "category_id" | "is_sold" | "is_featured" | "created_at" | "updated_at"> {
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
  searchTerm?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  excludeId?: string;
  limit?: number;
}

type ProductRow = Product & {
  product_images: ProductImage[];
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

type ProductListingRow = Pick<Product, "id" | "name" | "slug" | "price" | "discount_price" | "category_id" | "is_sold" | "is_featured" | "created_at" | "updated_at"> & {
  product_images: Array<Pick<ProductImage, "image_url" | "is_primary" | "sort_order">>;
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

const getCategoriesCached = unstable_cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return (data ?? []) as Category[];
}, ["catalog-categories"], { revalidate: 60, tags: ["catalog"] });

export const getCategories = () => getCategoriesCached();

const getCategoriesWithCountsCached = unstable_cache(async (): Promise<CategoryWithCount[]> => {
  const supabase = createPublicClient();
  const { data: categories, error: categoryError } = await supabase.from("categories").select("*, products(count)").order("name");

  if (categoryError) throw new Error(`Could not load categories: ${categoryError.message}`);
  type CategoryCountRow = Category & { products: Array<{ count: number }> };
  return ((categories ?? []) as unknown as CategoryCountRow[]).map(({ products, ...category }) => ({
    ...category,
    product_count: products?.[0]?.count ?? 0,
  }));
}, ["catalog-categories-with-counts"], { revalidate: 60, tags: ["catalog"] });

export const getCategoriesWithCounts = () => getCategoriesWithCountsCached();

export const getCategoryBySlug = unstable_cache(async (slug: string): Promise<Category | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Could not load category: ${error.message}`);
  return (data as Category | null) ?? null;
}, ["catalog-category-by-slug"], { revalidate: 60, tags: ["catalog"] });

export const getCategoryById = unstable_cache(async (id: string): Promise<Category | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load category: ${error.message}`);
  return (data as Category | null) ?? null;
}, ["catalog-category-by-id"], { revalidate: 60, tags: ["catalog"] });

export const getProducts = unstable_cache(async (filters: ProductFilters = {}): Promise<ProductCardData[]> => {
  const supabase = createPublicClient();

  let categoryId = filters.categoryId;
  if (!categoryId && filters.categorySlug) {
    const category = await getCategoryBySlug(filters.categorySlug);
    if (!category) return [];
    categoryId = category.id;
  }

  let query = supabase.from("products").select("id, name, slug, price, discount_price, category_id, is_sold, is_featured, created_at, updated_at, product_images(image_url, is_primary, sort_order), category:categories(id, name, slug)");
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.availability === "in_stock") query = query.eq("is_sold", false);
  if (filters.availability === "sold") query = query.eq("is_sold", true);
  if (filters.featuredOnly) query = query.eq("is_featured", true);
  if (filters.excludeId) query = query.neq("id", filters.excludeId);
  const searchTerm = filters.searchTerm?.trim().replace(/[\\%_,()]/g, " ").replace(/\s+/g, " ").trim();
  if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);

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

  const products = ((data ?? []) as unknown as ProductListingRow[]).map((row): ProductCardData => {
    const images = [...(row.product_images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      discount_price: row.discount_price,
      category_id: row.category_id,
      is_sold: row.is_sold,
      is_featured: row.is_featured,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.category ?? null,
      primary_image_url: images[0]?.image_url ?? null,
    };
  });
  if (filters.sort === "price-asc") {
    products.sort((a, b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price));
  } else if (filters.sort === "price-desc") {
    products.sort((a, b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price));
  }

  return products;
}, ["catalog-products"], { revalidate: 60, tags: ["catalog"] });

export const getProductBySlug = unstable_cache(async (slug: string): Promise<ProductWithCatalogData | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("products").select("*, product_images(*), category:categories(id, name, slug)").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  return mapProduct(data as unknown as ProductRow);
}, ["catalog-product-by-slug"], { revalidate: 60, tags: ["catalog"] });

export const getProductById = unstable_cache(async (id: string): Promise<ProductWithCatalogData | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("products").select("*, product_images(*), category:categories(id, name, slug)").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  return mapProduct(data as unknown as ProductRow);
}, ["catalog-product-by-id"], { revalidate: 60, tags: ["catalog"] });
