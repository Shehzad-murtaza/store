"use client";

import { ArrowLeft } from "lucide-react";
import { useNavigationHistory } from "@/components/layout/NavigationHistory";

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const { goBack } = useNavigationHistory();

  return <button
    type="button"
    onClick={() => goBack(fallbackHref)}
    className="inline-flex min-h-9 items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[#666] transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    aria-label="Go back to the previous page"
  >
    <ArrowLeft size={16} aria-hidden="true" />
    <span>Back</span>
  </button>;
}

export const PublicBackButton = BackButton;
