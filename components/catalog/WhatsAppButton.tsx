"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/catalog/format";

export function WhatsAppButton({ name, price, slug }: { name: string; price: number; slug: string }) {
  function shareWithSeller() {
    const productUrl = `${window.location.origin}/products/${encodeURIComponent(slug)}`;
    const message = [
      "Hello, I am interested in this product:",
      "",
      `*Product Name*: ${name}`,
      `*Price*: ${formatPKR(price)}`,
      `*Link*: ${productUrl}`,
      "",
      "Please give me more details.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/923260489379?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return <Button type="button" onClick={shareWithSeller} className="w-full gap-2 py-3.5 text-sm">
    <MessageCircle size={17} /> Share with Seller
  </Button>;
}
