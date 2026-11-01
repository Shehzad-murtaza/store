"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={`Switch to ${isDark ? "light" : "dark"} mode`} className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-[#333] transition-colors hover:bg-[#f3f3f3] ${className}`}>
    {isDark ? <Sun size={16} /> : <Moon size={16} />}
  </button>;
}
