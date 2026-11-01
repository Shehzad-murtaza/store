"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const links = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#eaeaea] bg-[#fafafa]/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="SHEZY home" className="inline-flex shrink-0 items-center"><BrandLogo width={126} /></Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
          {links.map((link) => <Link key={link.label} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={`text-[13px] transition-colors hover:text-black ${isActive(link.href) ? "font-semibold text-[#111]" : "text-[#555]"}`}>{link.label}</Link>)}
        </nav>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-[#111] transition hover:bg-[#f0f0f0] md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && <nav className="border-t border-[#eaeaea] bg-white px-4 py-3 md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-[1280px] gap-1 sm:px-2">
          {links.map((link) => <Link key={link.label} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-3 text-sm transition-colors hover:bg-[#f5f5f5] ${isActive(link.href) ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#444]"}`}>{link.label}</Link>)}
        </div>
      </nav>}
    </header>
  );
}
