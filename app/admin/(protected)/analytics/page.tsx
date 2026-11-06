import type { Metadata } from "next";
import Link from "next/link";
import { Download, Package, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { formatPKR } from "@/lib/catalog/format";
import { orderStatusTone } from "@/lib/catalog/orders";
import { ANALYTICS_RANGES, getAnalytics, parseRange } from "@/lib/supabase/analytics";

export const metadata: Metadata = { title: "Analytics · Admin" };
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = await searchParams;
  const range = parseRange(first(search.range));
  const data = await getAnalytics(range);

  const { kpis, points, peak, statuses, topProducts } = data;
  const paid = kpis.paidRevenue + kpis.outstanding > 0 ? Math.round((kpis.paidRevenue / (kpis.paidRevenue + kpis.outstanding)) * 100) : 0;

  const cards = [
    { label: "Revenue", value: formatPKR(kpis.revenue), icon: Wallet },
    { label: "Orders", value: String(kpis.orders), icon: ReceiptText },
    { label: "Average order", value: formatPKR(kpis.avgOrderValue), icon: TrendingUp },
    { label: "Units sold", value: String(kpis.units), icon: Package },
  ];

  const maxStatus = Math.max(0, ...statuses.map((entry) => entry.count));
  const maxProduct = topProducts[0]?.revenue ?? 0;

  return <main className="admin-content admin-analytics-page">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Insights</div>
        <h1 className="!my-0">Analytics</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <nav className="analytics-range-tabs" aria-label="Time range">
          {ANALYTICS_RANGES.map((entry) => <Link key={entry.key} href={`/admin/analytics?range=${entry.key}`} aria-current={entry.key === range.key ? "page" : undefined} className={`analytics-range-tab ${entry.key === range.key ? "active" : ""}`}>{entry.tab}</Link>)}
        </nav>
        <a href={`/admin/analytics/export?range=${range.key}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] bg-white px-3.5 text-xs font-medium text-[#333] transition-colors hover:bg-[#f7f7f7]"><Download size={15} />Export CSV</a>
      </div>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><span className="text-xs text-[#666]">{label}</span><Icon size={17} className="text-[#777]" /></div>
        <div className="mt-4 truncate text-2xl font-semibold tracking-[-0.03em]" title={value}>{value}</div>
      </div>)}
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4">
        <div><h2 className="text-sm font-semibold">Revenue</h2><p className="mt-1 text-xs text-[#777]">{range.label}</p></div>
        {peak && peak.revenue > 0 && <div className="text-right"><div className="text-[10px] uppercase tracking-[0.08em] text-[#999]">Best {range.bucket === "month" ? "month" : "day"}</div><div className="mt-1 text-sm font-medium">{peak.label} · {formatPKR(peak.revenue)}</div></div>}
      </div>
      <div className="px-4 py-5 sm:px-5"><RevenueChart points={points} /></div>
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Order status</h2>
        <div className="mt-4 grid gap-4">
          {statuses.map((entry) => <div key={entry.status} className="analytics-rank">
            <div className="flex items-center justify-between gap-3 text-xs"><span className={`status-pill ${orderStatusTone(entry.status)}`}>{entry.label}</span><span className="shrink-0 text-[#888]">{entry.count} · {formatPKR(entry.revenue)}</span></div>
            <div className="analytics-rank-track"><div className={`analytics-rank-fill ${orderStatusTone(entry.status)}`} style={{ width: `${maxStatus ? (entry.count / maxStatus) * 100 : 0}%` }} /></div>
          </div>)}
        </div>
      </div>

      <div className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Payments</h2>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div><div className="text-xs text-[#666]">Paid</div><div className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em]">{formatPKR(kpis.paidRevenue)}</div></div>
          <div className="text-right"><div className="text-xs text-[#666]">Outstanding</div><div className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em]">{formatPKR(kpis.outstanding)}</div></div>
        </div>
        <div className="analytics-split mt-5"><div className="analytics-split-paid" style={{ width: `${paid}%` }} /><div className="analytics-split-due" style={{ width: `${100 - paid}%` }} /></div>
        {kpis.cancelled > 0 && <p className="mt-4 text-xs text-[#888]">{kpis.cancelled} cancelled {kpis.cancelled === 1 ? "order" : "orders"} excluded.</p>}
      </div>
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      <div className="border-b border-[#eaeaea] px-5 py-4"><h2 className="text-sm font-semibold">Top products</h2></div>
      {topProducts.length ? <div className="divide-y divide-[#eaeaea]">
        {topProducts.map((product, index) => <div key={product.key} className="flex items-center gap-4 px-5 py-3.5">
          <span className="analytics-rank-index">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-[#222]">{product.slug ? <Link href={`/products/${product.slug}`} className="hover:underline">{product.name}</Link> : product.name}</div>
            <div className="analytics-rank-track mt-2"><div className="analytics-rank-fill" style={{ width: `${maxProduct ? (product.revenue / maxProduct) * 100 : 0}%` }} /></div>
          </div>
          <div className="shrink-0 text-right"><div className="whitespace-nowrap text-sm font-medium">{formatPKR(product.revenue)}</div><div className="mt-1 text-[10px] text-[#888]">{product.units} sold</div></div>
        </div>)}
      </div> : <p className="px-5 py-12 text-center text-sm text-[#777]">No products sold in this period.</p>}
    </section>
  </main>;
}
