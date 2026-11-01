"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, busy] = useActionState<LoginState, FormData>(loginAction, {});

  return <form action={formAction}>
    {state.error && <div className="login-error" role="alert">{state.error}</div>}
    <input type="hidden" name="next" value={nextPath} />
    <div className="login-field"><label htmlFor="email">Email address</label><Input id="email" name="email" type="email" autoComplete="username" required placeholder="you@example.com" /></div>
    <div className="login-field"><label htmlFor="password">Password</label><Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></div>
    <Button type="submit" disabled={busy} className="login-submit">{busy ? "Signing in…" : "Sign in to SHEZY"}</Button>
  </form>;
}
