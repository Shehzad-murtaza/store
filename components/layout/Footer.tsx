import React from "react";
import Link from "next/link";
import { MessageCircle, Mail, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          
          {/* 1. Brand & About */}
          <div className="space-y-4">
            <Link href="/" aria-label="SHEZY home" className="inline-flex">
              <BrandLogo width={126} />
            </Link>
            <p className="mt-2 text-[#666] text-sm leading-relaxed max-w-xs">
              A considered collection of pieces for everyday living. Good things, chosen well.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div className="sm:justify-self-center lg:justify-self-start">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#444] mb-4">Quick links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[#666] hover:text-black text-sm transition-colors">Home</Link></li>
              <li><Link href="/categories" className="text-[#666] hover:text-black text-sm transition-colors">Categories</Link></li>
              <li><Link href="/products" className="text-[#666] hover:text-black text-sm transition-colors">Products</Link></li>
              <li><Link href="/contact" className="text-[#666] hover:text-black text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* 3. Get in Touch */}
          <div className="lg:justify-self-center">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#444] mb-4">Get in touch</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+923260489379" className="text-[#666] hover:text-black text-sm transition-colors">
                  0326-0489379
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/923260489379" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-[#666] hover:text-black text-sm transition-colors"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div className="lg:justify-self-end w-full">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#444] mb-4">Stay in the loop</h3>
            <p className="text-[#666] text-sm mb-4">Subscribe to get special offers and updates.</p>
            <form className="relative flex items-center">
              <Mail className="absolute left-3 text-gray-400 h-4 w-4" />
              <input 
                type="email"
                name="email"
                placeholder="Your email" 
                className="w-full bg-[#fcfcfc] border border-[#eaeaea] text-sm rounded-lg py-2.5 pl-9 pr-10 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                required
              />
              <button 
                type="submit" 
                className="absolute right-1.5 p-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#eaeaea] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#777] text-xs text-center md:text-left">
            &copy; {currentYear} SHEZY. All rights reserved.
          </p>
          <div className="flex gap-3 items-center">
            <span className="text-[10px] font-semibold text-[#888] uppercase tracking-wider border border-[#eaeaea] px-2 py-1 rounded">COD</span>
            <span className="text-[10px] font-semibold text-[#888] uppercase tracking-wider border border-[#eaeaea] px-2 py-1 rounded">Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
