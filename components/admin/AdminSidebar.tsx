"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Layers3, LogOut, Menu, Package, Store, X } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers3 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className="admin-nav" aria-label="Admin navigation">
    {navigation.map(({ label, href, icon: Icon }) => {
      const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
      return <Link href={href} key={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><Icon size={16} strokeWidth={1.7} />{label}</Link>;
    })}
  </nav>;
}

export function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return <>
    <aside className="admin-sidebar flex h-screen flex-col">
      <Link className="admin-brand" href="/admin" aria-label="SHEZY admin dashboard"><BrandLogo width={132} /></Link>
      <div className="admin-label text-[10px] font-semibold uppercase tracking-[0.16em]">Workspace</div>
      <NavLinks />
      <div className="admin-sidebar-bottom">
        <div className="truncate text-sm text-[#777]" title={email}>{email}</div>
        <div className="mt-3 grid gap-1">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#555] hover:bg-[#f3f3f3]"><Store size={15} />View storefront</Link>
          <form action={logoutAction}><button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#555] hover:bg-[#f3f3f3]"><LogOut size={15} />Sign out</button></form>
        </div>
      </div>
    </aside>

    <div className="admin-mobile-bar"><button type="button" onClick={() => setOpen(true)} aria-label="Open admin navigation" className="flex size-10 items-center justify-center rounded-lg border border-[#eaeaea] bg-white"><Menu size={18} /></button><Link href="/admin" aria-label="SHEZY admin dashboard" className="inline-flex"><BrandLogo width={116} /></Link><span className="text-xs text-[#777]">Admin</span></div>
    {open && <div className="admin-sheet-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside className="admin-sheet" aria-label="Admin menu">
        <div className="mb-7 flex items-center justify-between"><Link href="/admin" aria-label="SHEZY admin dashboard" className="inline-flex"><BrandLogo width={132} /></Link><button type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation" className="rounded-lg p-2 text-[#555] hover:bg-[#f2f2f2]"><X size={18} /></button></div>
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">Workspace</div>
        <NavLinks onNavigate={() => setOpen(false)} />
        <div className="admin-sheet-bottom mt-auto border-t border-[#eaeaea] px-4 py-4"><div className="truncate text-sm text-[#777]" title={email}>{email}</div><div className="mt-3 grid gap-1"><Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#555] hover:bg-[#f3f3f3]"><Store size={15} />View storefront</Link><form action={logoutAction}><button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#555] hover:bg-[#f3f3f3]"><LogOut size={15} />Sign out</button></form></div></div>
      </aside>
    </div>}
  </>;
}
