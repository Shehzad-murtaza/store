import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full border border-[#dcdcd4] bg-[#fffefa] px-3 py-3.5 text-sm text-[#20231f] outline-none transition focus:border-[#747b5c] focus:ring-4 focus:ring-[#7a80611c]", className)} {...props} />;
}
