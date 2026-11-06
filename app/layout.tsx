import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const defaultTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: defaultTitle, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_PK",
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}><ThemeProvider><CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider></ThemeProvider></body>
    </html>
  );
}
