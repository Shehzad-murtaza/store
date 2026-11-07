"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, UserRound, Store } from "lucide-react";
import { AccountHeaderButton } from "@/components/account/AccountHeaderButton";
import { CartButton } from "@/components/cart/CartButton";
import { WishlistHeaderButton } from "@/components/wishlist/WishlistHeaderButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DashboardHeaderButton } from "@/components/layout/DashboardHeaderButton";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => setIsMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`glass-site-header sticky top-0 z-50 w-full border-b ${onHome ? "home-hero-header" : ""}`}>
      <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="public-header-menu inline-flex size-9 items-center justify-center rounded-lg text-[#222] transition-colors hover:bg-black/5 lg:hidden"
          >
            {isMenuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={19} strokeWidth={1.8} />}
          </button>
          <Link href="/" aria-label="SHEZY home" className="public-header-brand hidden lg:inline-flex">
            <BrandLogo width={122} />
          </Link>
        </div>

        <Link href="/" aria-label="SHEZY home" className="public-header-brand inline-flex lg:hidden">
          <BrandLogo width={112} />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {navigation.map(({ label, href }) => {
            const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`public-nav-link relative py-2 text-[13px] transition-colors ${active ? "font-semibold text-[#111]" : "font-medium text-[#666] hover:text-[#111]"}`}>
              {label}
              {active && <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-current" />}
            </Link>;
          })}
        </nav>

        <div className="public-header-controls col-start-3 flex items-center justify-end gap-1 sm:gap-1.5">
          <DashboardHeaderButton />
          <span className="hidden sm:inline-flex"><AccountHeaderButton /></span>
          <span className="hidden sm:inline-flex"><WishlistHeaderButton /></span>
          <CartButton />
          <ThemeToggle />
        </div>
      </div>

      </header>

      {isMenuOpen && <div className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[2px] lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsMenuOpen(false); }}>
        <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Main menu" className="mobile-navigation-panel absolute left-3 right-3 top-[72px] rounded-2xl border p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#eaeaea] px-2 pb-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">SHEZY</p><p className="mt-1 text-sm font-semibold">Explore the store</p></div>
            <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-[#333]"><X size={17} /></button>
          </div>
          <nav aria-label="Mobile navigation" className="grid gap-1 py-2">
            {navigation.map(({ label, href }) => {
              const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setIsMenuOpen(false)} className={`rounded-lg px-3 py-3 text-sm transition-colors ${active ? "bg-[#f3f3f3] font-semibold text-[#111]" : "text-[#555] hover:bg-[#f7f7f7] hover:text-[#111]"}`}>{label}</Link>;
            })}
          </nav>
          <div className="grid grid-cols-2 gap-2 border-t border-[#eaeaea] pt-3 sm:hidden">
            <Link href="/account" onClick={() => setIsMenuOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#eaeaea] text-xs font-medium text-[#444]"><UserRound size={15} />My account</Link>
            <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#eaeaea] text-xs font-medium text-[#444]"><Heart size={15} />Wishlist</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111] text-xs font-medium text-white"><Store size={15} />Help & support</Link>
          </div>
        </aside>
      </div>}
    </>
  );
}
