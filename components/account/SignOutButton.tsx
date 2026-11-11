"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className, compact = false, iconOnly = false }: { className: string; compact?: boolean; iconOnly?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      // Customer data belongs to the signed-in account. Do not expose it as a guest cart on logout.
      try {
        window.sessionStorage.removeItem("shezy-cart-session-v2");
        window.sessionStorage.removeItem("shezy-wishlist-session-v2");
        window.localStorage.removeItem("shezy-cart-v1");
        window.localStorage.removeItem("shezy-wishlist-v1");
      } catch { /* Storage can be unavailable. */ }

      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) {
        setError("We could not sign you out. Please try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("We could not sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <button type="button" onClick={signOut} disabled={busy} className={className}>
      {busy ? <LoaderCircle size={15} className="animate-spin" /> : <LogOut size={15} />}
      {iconOnly ? null : busy ? "Signing out…" : "Sign out"}
    </button>
    {error && <p className={`mt-2 text-xs text-red-600 ${compact ? "px-3" : ""}`} role="alert">{error}</p>}
  </div>;
}
