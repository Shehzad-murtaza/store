"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stock: number;
  sold: boolean;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "shezy-wishlist-v1";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredItems(): WishlistItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WishlistItem => item && typeof item.id === "string" && typeof item.slug === "string");
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable (private mode); the wishlist still works in memory.
    }
  }, [items, ready]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((current) => current.some((entry) => entry.id === item.id)
      ? current.filter((entry) => entry.id !== item.id)
      : [...current, item]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    ready,
    count: items.length,
    has: (id: string) => ids.has(id),
    toggle,
    remove,
    clear,
  }), [items, ready, ids, toggle, remove, clear]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
