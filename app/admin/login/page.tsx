import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default function AdminLoginPage() {
  return <main className="login-page">
    <section className="login-card">
      <Link href="/" className="login-brand">SHEZY</Link>
      <h1>Admin sign in</h1>
      <p>Sign in to manage your SHEZY catalogue.</p>
      <LoginForm />
      <div className="login-footnote">Private access for the store administrator.</div>
    </section>
  </main>;
}
