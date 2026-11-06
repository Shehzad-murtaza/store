import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="site-footer mt-12 border-t border-[#eaeaea] bg-white sm:mt-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-9 sm:grid-cols-2 sm:py-11 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" aria-label="SHEZY home" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#777]">
              <BrandLogo width={118} className="mx-0" />
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-[#666]">A considered edit of useful, well-chosen pieces for everyday living.</p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">Explore</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {footerLinks.map(({ label, href }) => <li key={href}><Link href={href} className="text-[13px] text-[#555] transition-colors hover:text-[#111]">{label}</Link></li>)}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">Get in touch</h2>
            <a href="tel:+923260489379" className="block w-fit text-[13px] text-[#555] transition-colors hover:text-[#111]">0326-0489379</a>
            <a href="https://wa.me/923260489379" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-[13px] text-[#555] transition-colors hover:text-[#111]">
              <MessageCircle size={15} strokeWidth={1.7} />WhatsApp<ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#eaeaea] py-5 text-[11px] text-[#777] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SHEZY. All rights reserved.</p>
          <p>Thoughtfully chosen for everyday living.</p>
        </div>
      </div>
    </footer>
  );
}
