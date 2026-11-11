"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Email or password is incorrect.");
        return;
      }

      const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin");
      if (adminCheckError || !isAdmin) {
        await supabase.auth.signOut();
        setError("This account does not have administrator access.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("We could not complete sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={handleSubmit}>
    {error && <div className="login-error" role="alert">{error}</div>}
    <input type="hidden" name="next" value={nextPath} />
    <div className="login-field"><label htmlFor="email">Email address</label><Input id="email" name="email" type="email" autoComplete="username" required placeholder="you@example.com" /></div>
    <div className="login-field"><label htmlFor="password">Password</label><Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></div>
    <Button type="submit" disabled={busy} className="login-submit">{busy ? "Signing in…" : "Sign in to SHEZY"}</Button>
  </form>;
}
