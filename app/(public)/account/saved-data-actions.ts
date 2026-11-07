"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartLine } from "@/components/cart/CartProvider";
import type { WishlistItem } from "@/components/wishlist/WishlistProvider";

type SavedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  discount_price: number | string | null;
  stock_quantity: number;
  is_sold: boolean;
  product_images: Array<{ image_url: string; is_primary: boolean; sort_order: number }> | null;
};

type SavedRow = { product_id: string; quantity?: number; products: SavedProduct | SavedProduct[] | null };

function firstProduct(value: SavedRow["products"]): SavedProduct | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function primaryImage(product: SavedProduct): string | null {
  const images = [...(product.product_images ?? [])].sort((a, b) =>
    Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
  return images[0]?.image_url ?? null;
}

async function currentUserId() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, userId: user.id };
}

/** Fetch saved products for the current customer; never accepts another user's id. */
export async function loadCustomerSavedLists(): Promise<{ userId: string; cart: CartLine[]; wishlist: WishlistItem[] } | null> {
  const current = await currentUserId();
  if (!current) return null;
  const { supabase, userId } = current;

  const [cartResult, wishlistResult] = await Promise.all([
    supabase.from("customer_cart_items")
      .select("product_id, quantity, products!inner(id, slug, name, price, discount_price, stock_quantity, is_sold, product_images(image_url, is_primary, sort_order))")
      .eq("user_id", userId),
    supabase.from("customer_wishlist_items")
      .select("product_id, products!inner(id, slug, name, price, discount_price, stock_quantity, is_sold, product_images(image_url, is_primary, sort_order))")
      .eq("user_id", userId),
  ]);

  if (cartResult.error) throw new Error(`Could not load your saved cart: ${cartResult.error.message}`);
  if (wishlistResult.error) throw new Error(`Could not load your wishlist: ${wishlistResult.error.message}`);

  const cart = ((cartResult.data ?? []) as unknown as SavedRow[]).flatMap((row) => {
    const product = firstProduct(row.products);
    const quantity = Number(row.quantity ?? 0);
    if (!product || quantity < 1 || product.is_sold || product.stock_quantity < 1) return [];
    return [{
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPrice: Number(product.discount_price ?? product.price),
      imageUrl: primaryImage(product),
      quantity: Math.min(quantity, product.stock_quantity),
      maxStock: product.stock_quantity,
    } satisfies CartLine];
  });

  const wishlist = ((wishlistResult.data ?? []) as unknown as SavedRow[]).flatMap((row) => {
    const product = firstProduct(row.products);
    if (!product) return [];
    return [{
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      discountPrice: product.discount_price === null ? null : Number(product.discount_price),
      imageUrl: primaryImage(product),
      stock: product.stock_quantity,
      sold: product.is_sold,
    } satisfies WishlistItem];
  });

  return { userId, cart, wishlist };
}

export async function syncCustomerCart(userId: string, lines: Array<{ productId: string; quantity: number }>) {
  const current = await currentUserId();
  if (!current || current.userId !== userId) return;
  const { error } = await current.supabase.rpc("sync_customer_cart", {
    p_items: lines.map(({ productId, quantity }) => ({ product_id: productId, quantity })),
  });
  if (error) console.error("Could not sync customer cart:", error.message);
}

export async function syncCustomerWishlist(userId: string, productIds: string[]) {
  const current = await currentUserId();
  if (!current || current.userId !== userId) return;
  const { error } = await current.supabase.rpc("sync_customer_wishlist", { p_product_ids: productIds });
  if (error) console.error("Could not sync customer wishlist:", error.message);
}
