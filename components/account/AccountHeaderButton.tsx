import Link from "next/link";
import { CircleUserRound } from "lucide-react";

export function AccountHeaderButton() {
  return <Link href="/account/profile" aria-label="My profile" className="public-header-account inline-flex size-10 items-center justify-center rounded-lg text-[#111] transition-colors hover:bg-[#f0f0f0]">
    <CircleUserRound size={19} strokeWidth={1.7} />
  </Link>;
}
