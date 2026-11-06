import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "SHEZY — Considered finds, beautifully chosen", template: "%s | SHEZY" },
  description: "A thoughtfully curated collection of beautiful finds, chosen to stay with you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}><ThemeProvider><CartProvider>{children}</CartProvider></ThemeProvider></body>
    </html>
  );
}
