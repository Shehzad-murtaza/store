"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/layout/PublicBackButton";

export function AdminBackButton() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const fallbackHref = segments.length <= 1 ? "/" : `/${segments.slice(0, 2).join("/")}`;
  return <BackButton fallbackHref={fallbackHref} />;
}
