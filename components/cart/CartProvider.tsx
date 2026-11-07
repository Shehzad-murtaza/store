"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadCustomerSavedLists, syncCustomerCart } from "@/app/(public)/account/saved-data-actions";

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

const STORAGE_KEY = "shezy-cart-session-v2";
const LEGACY_STORAGE_KEY = "shezy-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
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
  const [userId, setUserId] = useState<string | null>(null);
  const persistQueue = useRef(Promise.resolve());
  const currentUserId = useRef<string | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let active = true;
    let generation = 0;
    let unsubscribe = () => {};

    async function hydrate(nextUserId: string | null) {
      if (!active) return;
      if (currentUserId.current === nextUserId && readyRef.current) return;
      const request = ++generation;
      currentUserId.current = nextUserId;
      readyRef.current = false;
      setReady(false);
      setUserId(nextUserId);

      try { window.localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* Storage can be unavailable. */ }

      if (!nextUserId) {
        setLines(readStoredLines());
        readyRef.current = true;
        setReady(true);
        return;
      }

      try {
        const saved = await loadCustomerSavedLists();
        if (!active || request !== generation) return;
        if (saved?.userId === nextUserId) {
          const guestLines = readStoredLines();
          const merged = new Map(saved.cart.map((line) => [line.productId, line]));
          for (const guest of guestLines) {
            const existing = merged.get(guest.productId);
            merged.set(guest.productId, existing
              ? { ...existing, quantity: Math.min(existing.quantity + guest.quantity, existing.maxStock) }
              : guest);
          }
          setLines([...merged.values()]);
          try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
        } else {
          setLines(readStoredLines());
        }
      } catch (error) {
        console.error("Could not load saved customer cart:", error);
        if (!active || request !== generation) return;
        setLines(readStoredLines());
      }

      if (!active || request !== generation) return;
      readyRef.current = true;
      setReady(true);
    }

    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (!active) return;
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        void hydrate(session?.user.id ?? null);
      });
      unsubscribe = () => subscription.unsubscribe();
      void supabase.auth.getUser().then(({ data }) => hydrate(data.user?.id ?? null));
    });

    return () => {
      active = false;
      generation++;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (userId) {
      const snapshot = lines.map(({ productId, quantity }) => ({ productId, quantity }));
      const timer = window.setTimeout(() => {
        persistQueue.current = persistQueue.current.then(() => syncCustomerCart(userId, snapshot));
      }, 250);
      return () => window.clearTimeout(timer);
    }
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* Memory-only fallback. */ }
  }, [lines, ready, userId]);

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
