import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3, Package, ReceiptText, Star, Tag, TrendingUp, TriangleAlert, Wallet, type LucideIcon } from "lucide-react";
import { formatDateTime, formatPKR } from "@/lib/catalog/format";
import { orderStatusLabel, orderStatusTone } from "@/lib/catalog/orders";
import { getAdminOverview } from "@/lib/supabase/admin-data";
import { getAnalytics, parseRange } from "@/lib/supabase/analytics";

export const metadata: Metadata = { title: "Overview" };

export default function AdminHomePage() {
  return <AdminDashboard />;
}

type StatCard = { label: string; value: string | number; hint?: string; icon: LucideIcon; href: string };

async function AdminDashboard() {
  const [{ categoryCount, productCount, featuredCount, soldCount, recentProducts, orderCount, pendingOrders, revenue, pendingReviews, recentOrders, pendingPaymentCount, outstanding, lowStockCount, lowStockProducts }, analytics] = await Promise.all([getAdminOverview(), getAnalytics(parseRange("30d"))]);

  const sales: StatCard[] = [
    { label: "Total orders", value: orderCount, icon: ReceiptText, href: "/admin/orders" },
    { label: "Pending orders", value: pendingOrders, icon: TrendingUp, href: "/admin/orders?status=pending" },
    { label: "Payments due", value: pendingPaymentCount, hint: `${formatPKR(outstanding)} outstanding`, icon: Wallet, href: "/admin/orders?payment=unpaid" },
    { label: "Revenue", value: formatPKR(revenue), icon: Wallet, href: "/admin/orders" },
    { label: "Low stock", value: lowStockCount, hint: "5 or fewer left", icon: TriangleAlert, href: "/admin/products" },
    { label: "Pending reviews", value: pendingReviews, icon: Star, href: "/admin/reviews?status=pending" },
  ];
  const stats: StatCard[] = [
    { label: "Total categories", value: categoryCount, icon: Layers3, href: "/admin/categories" },
    { label: "Total products", value: productCount, icon: Package, href: "/admin/products" },
    { label: "Featured products", value: featuredCount, icon: Star, href: "/admin/products?featured=true" },
    { label: "Sold products", value: soldCount, icon: Tag, href: "/admin/products?status=sold" },
  ];

  return <main className="admin-content">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Store overview</div><h1>Dashboard</h1><p className="!mt-1">A quick look at your SHEZY store.</p></div><Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#333]">Add product <ArrowRight size={14} /></Link></div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sales.map(({ label, value, hint, icon: Icon, href }) => <Link href={href} key={label} className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm transition hover:shadow-md"><div className="flex items-center justify-between"><span className="text-xs text-[#666]">{label}</span><Icon size={17} className="text-[#777]" /></div><div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{value}</div>{hint && <div className="mt-1.5 text-[11px] text-[#777]">{hint}</div>}</Link>)}
    </section>

    <section className="mt-8 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4"><div><h2 className="text-sm font-semibold">Recent orders</h2><p className="mt-1 text-xs text-[#777]">The latest orders placed on your storefront.</p></div><Link href="/admin/orders" className="text-xs font-medium text-[#555] hover:text-black">View all <ArrowRight size={13} className="ml-1 inline" /></Link></div>
      {recentOrders.length ? <div className="divide-y divide-[#eaeaea]">{recentOrders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#fafafa] sm:gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[#eaeaea] bg-[#f3f3f2]"><ReceiptText size={18} className="text-[#888]" /></div>
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{order.order_number}</div><div className="mt-1 truncate text-xs text-[#777]">{order.customer_name}</div></div>
        <div className="hidden text-right sm:block"><div className="text-sm font-medium">{formatPKR(order.total)}</div><div className="mt-1 text-[10px] text-[#777]">{formatDateTime(order.created_at)}</div></div>
        <span className={`status-pill ${orderStatusTone(order.status)}`}>{orderStatusLabel(order.status)}</span>
        <ArrowRight size={15} className="shrink-0 text-[#888]" />
      </Link>)}</div> : <div className="px-5 py-12 text-center"><ReceiptText size={22} className="mx-auto text-[#999]" /><p className="mt-3 text-sm font-medium">No orders yet</p><p className="mt-1 text-xs text-[#777]">New orders from your storefront will appear here.</p></div>}
    </section>

    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4"><div><h2 className="text-sm font-semibold">Top products</h2><p className="mt-1 text-xs text-[#777]">Best sellers over the last 30 days.</p></div><Link href="/admin/analytics" className="text-xs font-medium text-[#555] hover:text-black">Analytics <ArrowRight size={13} className="ml-1 inline" /></Link></div>
        {analytics.topProducts.length ? <div className="divide-y divide-[#eaeaea]">{analytics.topProducts.slice(0, 5).map((product, index) => <div key={product.key} className="flex items-center gap-3 px-5 py-3">
          <span className="w-4 shrink-0 text-xs font-semibold text-[#999]">{index + 1}</span>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{product.name}</div><div className="mt-0.5 text-xs text-[#777]">{product.units} {product.units === 1 ? "unit" : "units"} sold</div></div>
          <div className="shrink-0 text-sm font-medium">{formatPKR(product.revenue)}</div>
        </div>)}</div> : <div className="px-5 py-12 text-center"><Package size={22} className="mx-auto text-[#999]" /><p className="mt-3 text-sm font-medium">No sales yet</p><p className="mt-1 text-xs text-[#777]">Products will show up here once orders come in.</p></div>}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4"><div><h2 className="text-sm font-semibold">Low stock</h2><p className="mt-1 text-xs text-[#777]">Items that are running out.</p></div><Link href="/admin/products" className="text-xs font-medium text-[#555] hover:text-black">Products <ArrowRight size={13} className="ml-1 inline" /></Link></div>
        {lowStockProducts.length ? <div className="divide-y divide-[#eaeaea]">{lowStockProducts.map((product) => <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-[#fafafa]">
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{product.name}</div><div className="mt-0.5 text-xs text-[#777]">{product.stock_quantity === 0 ? "Out of stock" : `${product.stock_quantity} left`}</div></div>
          <span className={`admin-status shrink-0 ${product.stock_quantity === 0 ? "sold" : "featured"}`}>{product.stock_quantity === 0 ? "Out" : "Low"}</span>
          <ArrowRight size={15} className="shrink-0 text-[#888]" />
        </Link>)}</div> : <div className="px-5 py-12 text-center"><Package size={22} className="mx-auto text-[#999]" /><p className="mt-3 text-sm font-medium">Stock looks healthy</p><p className="mt-1 text-xs text-[#777]">No items are running low right now.</p></div>}
      </div>
    </section>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, href }) => <Link href={href} key={label} className="rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm transition hover:shadow-md"><div className="flex items-center justify-between"><span className="text-xs text-[#666]">{label}</span><Icon size={17} className="text-[#777]" /></div><div className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{value}</div></Link>)}
    </section>

    <section className="mt-8 overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4"><div><h2 className="text-sm font-semibold">Recent products</h2><p className="mt-1 text-xs text-[#777]">The latest items added to your catalogue.</p></div><Link href="/admin/products" className="text-xs font-medium text-[#555] hover:text-black">View all <ArrowRight size={13} className="ml-1 inline" /></Link></div>
      {recentProducts.length ? <div className="divide-y divide-[#eaeaea]">{recentProducts.map((product) => <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#fafafa] sm:gap-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#eaeaea] bg-[#f3f3f2]">{product.primary_image_url ? <Image src={product.primary_image_url} alt="" fill sizes="48px" className="object-cover" /> : <div className="grid h-full place-items-center text-[9px] text-[#999]">No image</div>}</div>
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{product.name}</div><div className="mt-1 truncate text-xs text-[#777]">{product.category?.name ?? "Uncategorized"}</div></div>
        <div className="hidden text-right sm:block"><div className="text-sm font-medium">{formatPKR(product.discount_price ?? product.price)}</div><div className="mt-1 text-[10px] text-[#777]">{product.is_sold ? "Sold" : "In stock"}</div></div>
        <ArrowRight size={15} className="shrink-0 text-[#888]" />
      </Link>)}</div> : <div className="px-5 py-12 text-center"><Package size={22} className="mx-auto text-[#999]" /><p className="mt-3 text-sm font-medium">No products yet</p><p className="mt-1 text-xs text-[#777]">Add your first product to get started.</p><Link href="/admin/products/new" className="mt-4 inline-block text-xs font-medium underline underline-offset-4">Create a product</Link></div>}
    </section>
  </main>;
}
