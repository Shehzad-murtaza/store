/** Brand and contact details shared across the storefront. */
export const SITE_NAME = "SHEZY";
export const SELLER_WHATSAPP = "923260489379";
export const SELLER_PHONE_DISPLAY = "0326-0489379";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/** Canonical origin for the storefront, without a trailing slash. */
export const SITE_URL = rawUrl.replace(/\/+$/, "");

export const SITE_TAGLINE = "Considered finds, beautifully chosen";
export const SITE_DESCRIPTION = "A thoughtfully curated collection of beautiful finds, chosen to stay with you.";
