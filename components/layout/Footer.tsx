import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-[#eaeaea] bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" aria-label="SHEZY home" className="inline-flex"><BrandLogo width={126} /></Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#666]">A considered collection of pieces for everyday living.</p>
        </div>
        <div className="sm:justify-self-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#444]">Quick links</p>
          <div className="grid gap-2 text-sm text-[#666]"><Link href="/" className="transition-colors hover:text-black">Home</Link><Link href="/categories" className="transition-colors hover:text-black">Categories</Link><Link href="/products" className="transition-colors hover:text-black">Products</Link><Link href="/contact" className="transition-colors hover:text-black">Contact</Link></div>
        </div>
        <div className="grid content-start gap-3 text-sm text-[#666] lg:justify-self-end">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#444]">Get in touch</p>
          <a href="tel:+923260489379" className="transition-colors hover:text-black">0326-0489379</a>
          <a href="https://wa.me/923260489379" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-black"><MessageCircle size={15} />WhatsApp</a>
        </div>
      </div>
      <div className="border-t border-[#eaeaea] py-4 text-center text-xs text-[#777]">© {new Date().getFullYear()} SHEZY. All rights reserved.</div>
    </footer>
  );
}
