"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePublicNavigation } from "@/components/layout/PublicNavigationHistory";

export function PublicBackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();
  const canGoBack = usePublicNavigation();

  return <button
    type="button"
    onClick={() => canGoBack ? router.back() : router.replace(fallbackHref)}
    className="inline-flex min-h-9 items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[#666] transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    aria-label="Go back to the previous page"
  >
    <ArrowLeft size={16} aria-hidden="true" />
    <span>Back</span>
  </button>;
}
