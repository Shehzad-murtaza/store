"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function DashboardHeaderButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient();
    let active = true;

    const resolveAdmin = async (hasSession: boolean) => {
      if (!hasSession) {
        if (active) setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (active) setIsAdmin(!error && data === true);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolveAdmin(Boolean(session?.user));
    });
    void supabase.auth.getSession().then(({ data }) => resolveAdmin(Boolean(data.session?.user)));

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!isAdmin) return null;

  return <Link href="/admin" className="public-header-dashboard inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#333] transition-colors hover:bg-black/5">Dashboard</Link>;
}
