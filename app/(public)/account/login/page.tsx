import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { AuthForm } from "@/components/account/AuthForm";
import { getCurrentCustomer } from "@/lib/supabase/customer";
import { BackButton } from "@/components/layout/PublicBackButton";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ next?: string }> };

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/account") || value.startsWith("//")) return "/account/profile";
  return value;
}

export default async function AccountLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = safeNext(next);

  const user = await getCurrentCustomer();
  if (user) redirect(nextPath);

  return <main className="mx-auto min-h-[60vh] w-full max-w-md px-4 py-8 sm:px-6 sm:py-12">
    <BackButton fallbackHref="/products" />

    <div className="mt-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f5f5f4] text-[#555]"><CircleUserRound size={20} strokeWidth={1.5} /></span>
      <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Your SHEZY account</h1>
      <p className="mt-2 text-sm leading-6 text-[#666]">Sign in to follow your orders and keep track of every purchase.</p>
    </div>

    <div className="mt-7 rounded-xl border border-[#eaeaea] bg-white p-5 shadow-sm sm:p-6">
      <AuthForm nextPath={nextPath} />
    </div>
  </main>;
}
