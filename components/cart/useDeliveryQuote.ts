"use client";

import { useEffect, useMemo, useState } from "react";
import { getDeliveryQuote } from "@/app/(public)/checkout/actions";
import type { CartLine } from "@/components/cart/CartProvider";

export function useDeliveryQuote(lines: CartLine[], fallbackDefaultFee: number) {
  const productIds = useMemo(() => [...new Set(lines.map((line) => line.productId))], [lines]);
  const productKey = productIds.join(",");
  const [quote, setQuote] = useState<{ defaultDeliveryFee: number; productFees: Record<string, number> }>({
    defaultDeliveryFee: fallbackDefaultFee,
    productFees: {},
  });

  useEffect(() => {
    let active = true;
    getDeliveryQuote(productKey ? productKey.split(",") : []).then((nextQuote) => {
      if (active) setQuote(nextQuote);
    }).catch((error) => {
      console.error("Could not refresh delivery quote:", error);
    });
    return () => { active = false; };
  }, [productKey, fallbackDefaultFee]);

  return {
    defaultDeliveryFee: quote.defaultDeliveryFee,
    feeFor: (line: CartLine) => quote.productFees[line.productId] ?? line.deliveryFee,
  };
}
