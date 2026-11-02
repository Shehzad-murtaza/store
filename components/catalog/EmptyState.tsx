import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export function EmptyState({ title, description, actionHref, actionLabel, actionClassName, className }: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  actionClassName?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-dashed border-[#dedede] bg-white px-6 py-10 text-center shadow-sm sm:py-12 ${className ?? ""}`}>
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#f5f5f4] text-[#555]"><Search size={18} strokeWidth={1.5} /></span>
      <h3 className="mt-4 text-base font-semibold tracking-[-0.02em]">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#666]">{description}</p>}
      {actionHref && actionLabel && <Link href={actionHref} className={actionClassName ?? "mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#222] hover:underline"}>{actionLabel}<ArrowRight size={15} /></Link>}
    </div>
  );
}
