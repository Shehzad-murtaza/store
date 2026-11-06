"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#eaeaea] px-4 text-xs font-medium text-[#444] transition-colors hover:bg-[#f7f7f7]"><Printer size={15} />Print invoice</button>;
}
