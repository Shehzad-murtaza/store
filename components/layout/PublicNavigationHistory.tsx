"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PublicNavigationContext = createContext(false);

export function PublicNavigationHistory({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (previousPath.current && previousPath.current !== pathname) setCanGoBack(true);
    previousPath.current = pathname;
  }, [pathname]);

  return <PublicNavigationContext.Provider value={canGoBack}>{children}</PublicNavigationContext.Provider>;
}

export function usePublicNavigation() {
  return useContext(PublicNavigationContext);
}
