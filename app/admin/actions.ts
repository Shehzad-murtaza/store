"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/catalog/slug";

export interface AdminActionResult {
  ok: boolean;
  id?: string;
  error?: string;
  warning?: string;
}

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  if (index < 0) return null;
  try {
    return decodeURIComponent(url.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function removeStoragePaths(paths: Array<string | null>) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return null;
  const supabase = await createClient();
  const { error } = await supabase.storage.from("product-images").remove(uniquePaths);
  return error?.message ?? null;
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveCategory(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const id = field(formData, "id");
  const name = field(formData, "name");
  const slug = slugify(field(formData, "slug"));
  const description = field(formData, "description");

  if (!name || name.length > 120) return { ok: false, error: "Enter a category name of 120 characters or fewer." };
  if (!validSlug(slug)) return { ok: false, error: "Enter a valid category slug using letters, numbers, and hyphens." };

  const values = { name, slug, description: description || null };
  const result = id
    ? await supabase.from("categories").update(values).eq("id", id).select("id").maybeSingle()
    : await supabase.from("categories").insert(values).select("id").single();

  if (result.error) return { ok: false, error: result.error.message.includes("categories_slug_key") ? "That slug is already in use." : result.error.message };
  if (!result.data) return { ok: false, error: "Category not found." };
  return { ok: true, id: result.data.id };
}

export async function setCategoryImage(categoryId: string, path: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!path.startsWith(`categories/${categoryId}/`)) return { ok: false, error: "Invalid image path." };

  const supabase = await createClient();
  const { data: category, error: readError } = await supabase.from("categories").select("image_url").eq("id", categoryId).maybeSingle();
  if (readError || !category) return { ok: false, error: readError?.message ?? "Category not found." };

  const imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  const { error } = await supabase.from("categories").update({ image_url: imageUrl }).eq("id", categoryId);
  if (error) return { ok: false, error: error.message };

  const cleanupWarning = await removeStoragePaths([storagePathFromUrl(category.image_url)]);
  return { ok: true, warning: cleanupWarning ? "Category saved, but its previous image could not be removed from storage." : undefined };
}

export async function removeCategoryImage(categoryId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: category, error: readError } = await supabase.from("categories").select("image_url").eq("id", categoryId).maybeSingle();
  if (readError || !category) return { ok: false, error: readError?.message ?? "Category not found." };
  const { error } = await supabase.from("categories").update({ image_url: null }).eq("id", categoryId);
  if (error) return { ok: false, error: error.message };
  const cleanupWarning = await removeStoragePaths([storagePathFromUrl(category.image_url)]);
  return { ok: true, warning: cleanupWarning ? "Image removed from the category, but its file could not be removed from storage." : undefined };
}

export async function deleteCategory(categoryId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: category, error: readError } = await supabase.from("categories").select("image_url").eq("id", categoryId).maybeSingle();
  if (readError || !category) return { ok: false, error: readError?.message ?? "Category not found." };

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { ok: false, error: error.message };
  const cleanupWarning = await removeStoragePaths([storagePathFromUrl(category.image_url)]);
  return { ok: true, warning: cleanupWarning ? "Category deleted, but its image could not be removed from storage." : undefined };
}

export async function saveProduct(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const id = field(formData, "id");
  const name = field(formData, "name");
  const slug = slugify(field(formData, "slug"));
  const description = field(formData, "description");
  const categoryId = field(formData, "category_id");
  const priceText = field(formData, "price").trim();
  const price = Number(priceText);
  const discountText = field(formData, "discount_price");
  const discountValue = discountText.trim() === "" ? null : Number(discountText);
  const discountPrice = discountValue === 0 ? null : discountValue;
  const primarySelection = field(formData, "primarySelection");

  if (!name || name.length > 180) return { ok: false, error: "Enter a product name of 180 characters or fewer." };
  if (!validSlug(slug)) return { ok: false, error: "Enter a valid product slug using letters, numbers, and hyphens." };
  if (!priceText || !Number.isFinite(price) || price < 0) return { ok: false, error: "Enter a valid price in PKR." };
  if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice < 0 || discountPrice >= price)) {
    return { ok: false, error: "The discount price must be a valid amount below the original price." };
  }

  const values = {
    name,
    slug,
    description: description || null,
    category_id: categoryId || null,
    price,
    discount_price: discountPrice,
    is_featured: formData.get("is_featured") === "on",
    is_sold: formData.get("is_sold") === "on",
  };
  const result = id
    ? await supabase.from("products").update(values).eq("id", id).select("id").maybeSingle()
    : await supabase.from("products").insert(values).select("id").single();

  if (result.error) return { ok: false, error: result.error.message.includes("products_slug_key") ? "That slug is already in use." : result.error.message };
  if (!result.data) return { ok: false, error: "Product not found." };
  const productId = result.data.id;

  if (primarySelection.startsWith("new:")) {
    const { error } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    if (error) return { ok: false, error: error.message };
  } else if (primarySelection.startsWith("existing:")) {
    const imageId = primarySelection.slice("existing:".length);
    const { data: image, error: imageError } = await supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle();
    if (imageError || !image) return { ok: false, error: "The selected primary image could not be found." };
    const { error: clearError } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    if (clearError) return { ok: false, error: clearError.message };
    const { error: primaryError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId);
    if (primaryError) return { ok: false, error: primaryError.message };
  }

  return { ok: true, id: productId };
}

export async function addProductImages(productId: string, paths: string[], primaryIndex: number): Promise<AdminActionResult> {
  await requireAdmin();
  if (!paths.length || paths.length > 10 || paths.some((path) => !path.startsWith(`${productId}/`))) {
    return { ok: false, error: "The uploaded image list is invalid." };
  }

  const supabase = await createClient();
  const publicUrls = paths.map((path) => supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  const { data: lastImage, error: orderError } = await supabase.from("product_images").select("sort_order").eq("product_id", productId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  if (orderError) return { ok: false, error: orderError.message };
  const nextSortOrder = (lastImage?.sort_order ?? -1) + 1;
  const rows = publicUrls.map((image_url, index) => ({ product_id: productId, image_url, is_primary: false, sort_order: nextSortOrder + index }));
  const { data, error } = await supabase.from("product_images").insert(rows).select("id");
  if (error) return { ok: false, error: error.message };

  if (primaryIndex >= 0 && primaryIndex < (data?.length ?? 0)) {
    const { error: primaryError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", data![primaryIndex].id).eq("product_id", productId);
    if (primaryError) {
      await supabase.from("product_images").delete().in("id", (data ?? []).map((image) => image.id));
      return { ok: false, error: primaryError.message };
    }
  }

  return { ok: true };
}

export async function deleteProductImage(imageId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: image, error: readError } = await supabase.from("product_images").select("id, product_id, image_url, is_primary").eq("id", imageId).maybeSingle();
  if (readError || !image) return { ok: false, error: readError?.message ?? "Image not found." };
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { ok: false, error: error.message };
  if (image.is_primary) {
    const { data: replacement } = await supabase.from("product_images").select("id").eq("product_id", image.product_id).order("sort_order").limit(1).maybeSingle();
    if (replacement) await supabase.from("product_images").update({ is_primary: true }).eq("id", replacement.id);
  }
  const cleanupWarning = await removeStoragePaths([storagePathFromUrl(image.image_url)]);
  return { ok: true, warning: cleanupWarning ? "Image record deleted, but its file could not be removed from storage." : undefined };
}

export async function deleteProduct(productId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: images, error: readError } = await supabase.from("product_images").select("image_url").eq("product_id", productId);
  if (readError) return { ok: false, error: readError.message };
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { ok: false, error: error.message };
  const cleanupWarning = await removeStoragePaths((images ?? []).map((image) => storagePathFromUrl(image.image_url)));
  return { ok: true, warning: cleanupWarning ? "Product deleted, but one or more image files could not be removed from storage." : undefined };
}
