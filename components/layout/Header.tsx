"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Heart, User, Search } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-black focus:outline-none p-2 -ml-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center lg:justify-start flex-1 lg:flex-none">
            <Link href="/" className="text-2xl font-black tracking-tighter text-black">
              SHEZY STORE
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:gap-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-black ${
                  pathname === link.href ? "text-black border-b-2 border-black pb-1" : "text-gray-500"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center justify-end gap-x-4 lg:gap-x-6">
            <button className="hidden sm:flex text-gray-600 hover:text-black transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/account" className="text-gray-600 hover:text-black transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" className="hidden sm:flex text-gray-600 hover:text-black transition-colors relative">
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                0
              </span>
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-black transition-colors relative flex items-center">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Slide-over) */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      >
        <div
          className={`fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <span className="text-xl font-bold tracking-tight">Menu</span>
            <button onClick={toggleMenu} className="text-gray-500 hover:text-black p-2 rounded-md bg-gray-50">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex flex-col p-4 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={toggleMenu}
                className={`text-lg font-medium p-3 rounded-md transition-colors ${
                  pathname === link.href ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="absolute bottom-0 w-full border-t p-4 bg-gray-50">
            <Link href="/wishlist" onClick={toggleMenu} className="flex items-center gap-x-3 text-gray-700 p-3 font-semibold hover:bg-gray-200 rounded-md transition">
              <Heart className="h-5 w-5" /> Wishlist
            </Link>
            <Link href="/contact" onClick={toggleMenu} className="flex items-center gap-x-3 text-gray-700 p-3 font-semibold hover:bg-gray-200 rounded-md transition mt-2">
               Help & Support
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}