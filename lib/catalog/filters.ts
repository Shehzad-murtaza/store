import type { ProductFilters } from "@/lib/supabase/catalog";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export interface ParsedCatalogFilters extends ProductFilters {
  category?: string;
  minPriceInput: string;
  maxPriceInput: string;
  availabilityValue: "all" | "in_stock" | "sold";
  sortValue: "newest" | "price-asc" | "price-desc";
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePrice(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000) return undefined;
  return Math.round(parsed * 100) / 100;
}

export function parseCatalogFilters(params: CatalogSearchParams): ParsedCatalogFilters {
  const category = first(params.category);
  const minPriceInput = first(params.minPrice);
  const maxPriceInput = first(params.maxPrice);
  const availabilityParam = first(params.availability);
  const availabilityValue = availabilityParam === "in_stock" || availabilityParam === "sold" ? availabilityParam : "all";
  const sortParam = first(params.sort);
  const sortValue = sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "newest";

  return {
    category: category || undefined,
    categorySlug: category || undefined,
    minPrice: parsePrice(minPriceInput),
    maxPrice: parsePrice(maxPriceInput),
    availability: availabilityValue === "all" ? undefined : availabilityValue,
    availabilityValue,
    featuredOnly: first(params.featured) === "true",
    sort: sortValue,
    sortValue,
    minPriceInput,
    maxPriceInput,
  };
}
