"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationHistoryValue {
  goBack: (fallbackHref: string) => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryValue>({
  goBack: () => {},
});

const AUTH_ROUTES = new Set(["/account/login", "/admin/login"]);

export function NavigationHistory({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef<string | null>(null);
  const pendingTarget = useRef<string | null>(null);
  const stack = useRef<string[]>([]);

  useEffect(() => {
    if (previousPath.current && previousPath.current !== pathname) {
      if (pendingTarget.current === pathname) {
        pendingTarget.current = null;
      } else if (!AUTH_ROUTES.has(previousPath.current)) {
        stack.current.push(previousPath.current);
      }
    }
    previousPath.current = pathname;
  }, [pathname]);

  function goBack(fallbackHref: string) {
    let target = stack.current.pop();
    while (target && AUTH_ROUTES.has(target)) target = stack.current.pop();
    target ??= fallbackHref;
    pendingTarget.current = target;
    router.replace(target);
  }

  return <NavigationHistoryContext.Provider value={{ goBack }}>{children}</NavigationHistoryContext.Provider>;
}

export function useNavigationHistory() {
  return useContext(NavigationHistoryContext);
}
