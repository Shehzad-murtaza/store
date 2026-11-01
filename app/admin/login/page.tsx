import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin sign in" };

type PageProps = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/admin");
  const { next } = await searchParams;
  const safeNext = next && (next === "/admin" || next.startsWith("/admin/")) && !next.startsWith("//") && !next.includes("\\") ? next : "/admin";

  return <main className="login-page">
    <div className="login-theme"><ThemeToggle /></div>
    <section className="login-card">
      <Link href="/" aria-label="SHEZY home" className="login-brand"><BrandLogo width={145} /></Link>
      <h1>Admin sign in</h1>
      <p>Sign in to manage your SHEZY catalogue.</p>
      <LoginForm nextPath={safeNext} />
      <div className="login-footnote">Private access for the store administrator.</div>
    </section>
  </main>;
}
