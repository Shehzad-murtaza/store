import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const variants = {
    default: "bg-[#272a24] text-white hover:bg-[#3b3e36]",
    outline: "border border-[#deded6] bg-transparent text-[#272a24] hover:bg-[#f5f4ef]",
    ghost: "bg-transparent text-[#55584f] hover:bg-[#f1f0e9]",
  };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs tracking-[.08em] transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], className)} {...props} />;
}
