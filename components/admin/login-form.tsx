"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Those details didn't match an administrator account. Please try again.");
      setBusy(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return <form onSubmit={handleSubmit}>
    {error && <div className="login-error" role="alert">{error}</div>}
    <div className="login-field"><label htmlFor="email">Email address</label><Input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
    <div className="login-field"><label htmlFor="password">Password</label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div>
    <Button type="submit" disabled={busy} className="login-submit">{busy ? "Signing in…" : "Sign in to SHEZY"}</Button>
  </form>;
}
