"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DashboardHeaderButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setIsAdmin(false);
      return;
    }

    const supabase = createClient();
    let active = true;
    let requestId = 0;

    const resolveAdmin = async (hasSession: boolean) => {
      const currentRequest = ++requestId;
      if (!hasSession) {
        if (active) setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (active && currentRequest === requestId) setIsAdmin(!error && data === true);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        void resolveAdmin(false);
        return;
      }

      // Run the RPC after Supabase finishes its auth callback lock.
      window.setTimeout(() => void resolveAdmin(true), 0);
    });

    const refreshSession = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (active) void resolveAdmin(Boolean(data.session?.user));
      });
    };
    const refreshOnFocus = () => refreshSession();

    refreshSession();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", refreshOnFocus);
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (!isAdmin) return null;

  return <Link href="/admin" className="public-header-dashboard inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#333] transition-colors hover:bg-black/5">Dashboard</Link>;
}
