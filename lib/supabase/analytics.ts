import { ORDER_STATUSES } from "@/lib/catalog/orders";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus } from "@/types";

export type AnalyticsRangeKey = "7d" | "30d" | "90d" | "12m";

export interface AnalyticsRange {
  key: AnalyticsRangeKey;
  label: string;
  tab: string;
  days: number;
  bucket: "day" | "month";
}

const RANGES: Record<AnalyticsRangeKey, AnalyticsRange> = {
  "7d": { key: "7d", label: "Last 7 days", tab: "7 days", days: 7, bucket: "day" },
  "30d": { key: "30d", label: "Last 30 days", tab: "30 days", days: 30, bucket: "day" },
  "90d": { key: "90d", label: "Last 90 days", tab: "90 days", days: 90, bucket: "day" },
  "12m": { key: "12m", label: "Last 12 months", tab: "12 months", days: 365, bucket: "month" },
};

export const ANALYTICS_RANGES: AnalyticsRange[] = Object.values(RANGES);

export function parseRange(value: string | undefined): AnalyticsRange {
  return value && value in RANGES ? RANGES[value as AnalyticsRangeKey] : RANGES["30d"];
}

/** Start of the selected window, aligned to local midnight (day ranges show today). */
export function rangeStart(range: AnalyticsRange, now = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range.bucket === "month") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
    return start;
  }
  start.setDate(start.getDate() - (range.days - 1));
  return start;
}

export interface RevenuePoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface StatusRow {
  status: OrderStatus;
  label: string;
  count: number;
  revenue: number;
}

export interface TopProductRow {
  key: string;
  name: string;
  slug: string | null;
  units: number;
  revenue: number;
}

export interface AnalyticsData {
  range: { key: AnalyticsRangeKey; label: string; bucket: "day" | "month"; from: string; to: string };
  kpis: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
    units: number;
    paidRevenue: number;
    outstanding: number;
    cancelled: number;
  };
  points: RevenuePoint[];
  peak: RevenuePoint | null;
  statuses: StatusRow[];
  topProducts: TopProductRow[];
}

type OrderRow = Pick<Order, "id" | "status" | "payment_status" | "total" | "created_at">;
type ItemRow = Pick<OrderItem, "product_id" | "product_name" | "product_slug" | "quantity" | "line_total">;

const pad = (value: number) => String(value).padStart(2, "0");

function bucketKey(date: Date, bucket: "day" | "month"): string {
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  return bucket === "month" ? base : `${base}-${pad(date.getDate())}`;
}

function bucketLabel(key: string, bucket: "day" | "month"): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day ?? 1).toLocaleDateString("en-PK", bucket === "month" ? { month: "short", year: "2-digit" } : { month: "short", day: "numeric" });
}

/** Every bucket in the window so quiet days render as empty columns instead of gaps. */
function buildBuckets(range: AnalyticsRange, now: Date): string[] {
  const cursor = rangeStart(range, now);
  const keys: string[] = [];
  const total = range.bucket === "month" ? 12 : range.days;
  for (let index = 0; index < total; index += 1) {
    keys.push(bucketKey(cursor, range.bucket));
    if (range.bucket === "month") cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

async function getRangeItems(orderIds: string[]): Promise<ItemRow[]> {
  if (!orderIds.length) return [];
  const supabase = await createClient();
  const chunks: string[][] = [];
  for (let index = 0; index < orderIds.length; index += 200) chunks.push(orderIds.slice(index, index + 200));

  const results = await Promise.all(chunks.map((ids) => supabase.from("order_items").select("product_id, product_name, product_slug, quantity, line_total").in("order_id", ids)));
  const items: ItemRow[] = [];
  for (const result of results) {
    if (result.error) throw new Error(`Could not load sold items: ${result.error.message}`);
    items.push(...((result.data ?? []) as unknown as ItemRow[]));
  }
  return items;
}

export async function getAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
  const supabase = await createClient();
  const now = new Date();
  const from = rangeStart(range, now);

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_status, total, created_at")
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Could not load analytics: ${error.message}`);

  const orders = (data ?? []) as unknown as OrderRow[];
  const active = orders.filter((order) => order.status !== "cancelled");

  const revenue = active.reduce((sum, order) => sum + Number(order.total), 0);
  const paidRevenue = active.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0);

  const buckets = new Map(buildBuckets(range, now).map((key) => [key, { revenue: 0, orders: 0 }]));
  for (const order of active) {
    const bucket = buckets.get(bucketKey(new Date(order.created_at), range.bucket));
    if (!bucket) continue;
    bucket.revenue += Number(order.total);
    bucket.orders += 1;
  }
  const points: RevenuePoint[] = [...buckets.entries()].map(([key, value]) => ({ key, label: bucketLabel(key, range.bucket), ...value }));
  const peak = points.reduce<RevenuePoint | null>((best, point) => (point.revenue > (best?.revenue ?? 0) ? point : best), null);

  const statuses: StatusRow[] = ORDER_STATUSES.map(({ value, label }) => {
    const rows = orders.filter((order) => order.status === value);
    return { status: value, label, count: rows.length, revenue: rows.reduce((sum, order) => sum + Number(order.total), 0) };
  });

  const items = await getRangeItems(active.map((order) => order.id));
  const products = new Map<string, TopProductRow>();
  for (const item of items) {
    const key = item.product_id ?? `name:${item.product_name}`;
    const entry = products.get(key) ?? { key, name: item.product_name, slug: item.product_slug, units: 0, revenue: 0 };
    entry.units += Number(item.quantity);
    entry.revenue += Number(item.line_total);
    products.set(key, entry);
  }
  const topProducts = [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  return {
    range: { key: range.key, label: range.label, bucket: range.bucket, from: from.toISOString(), to: now.toISOString() },
    kpis: {
      orders: orders.length,
      revenue,
      avgOrderValue: active.length ? revenue / active.length : 0,
      units: items.reduce((sum, item) => sum + Number(item.quantity), 0),
      paidRevenue,
      outstanding: revenue - paidRevenue,
      cancelled: orders.length - active.length,
    },
    points,
    peak,
    statuses,
    topProducts,
  };
}
