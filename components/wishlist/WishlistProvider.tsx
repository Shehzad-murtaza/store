"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadCustomerSavedLists, syncCustomerWishlist } from "@/app/(public)/account/saved-data-actions";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  deliveryFee: number;
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

const STORAGE_KEY = "shezy-wishlist-session-v2";
const LEGACY_STORAGE_KEY = "shezy-wishlist-v1";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredItems(): WishlistItem[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
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
        setItems(readStoredItems());
        readyRef.current = true;
        setReady(true);
        return;
      }

      try {
        const saved = await loadCustomerSavedLists();
        if (!active || request !== generation) return;
        if (saved?.userId === nextUserId) {
          const merged = new Map(saved.wishlist.map((item) => [item.id, item]));
          for (const guest of readStoredItems()) merged.set(guest.id, guest);
          setItems([...merged.values()]);
          try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
        } else {
          setItems(readStoredItems());
        }
      } catch (error) {
        console.error("Could not load saved customer wishlist:", error);
        if (!active || request !== generation) return;
        setItems(readStoredItems());
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
      const snapshot = items.map(({ id }) => id);
      const timer = window.setTimeout(() => {
        persistQueue.current = persistQueue.current
          .then(() => syncCustomerWishlist(userId, snapshot))
          .catch((error) => { console.error("Could not persist customer wishlist:", error); });
      }, 250);
      return () => window.clearTimeout(timer);
    }
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Memory-only fallback. */ }
  }, [items, ready, userId]);

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
