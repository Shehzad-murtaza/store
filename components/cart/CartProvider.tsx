"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  /** Display-only price; the server always recomputes the real amount. */
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
  maxStock: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "shezy-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is CartLine =>
      line && typeof line.productId === "string" && typeof line.quantity === "number" && line.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be unavailable (private mode); the cart still works in memory.
    }
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    if (line.maxStock <= 0) return;
    setLines((current) => {
      const existing = current.find((item) => item.productId === line.productId);
      if (!existing) return [...current, { ...line, quantity: Math.min(quantity, line.maxStock) }];
      return current.map((item) => item.productId === line.productId
        ? { ...item, ...line, quantity: Math.min(item.quantity + quantity, line.maxStock) }
        : item);
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => current
      .map((item) => item.productId === productId
        ? { ...item, quantity: Math.max(0, Math.min(quantity, item.maxStock)) }
        : item)
      .filter((item) => item.quantity > 0));
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    ready,
    count: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0),
    addLine,
    setQuantity,
    removeLine,
    clear,
  }), [lines, ready, addLine, setQuantity, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
