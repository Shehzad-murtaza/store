"use client";

import { useActionState, useState } from "react";
import { CircleAlert, LoaderCircle, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { signInAction, signUpAction, type AuthState } from "@/app/(public)/account/actions";

type Mode = "signin" | "signup";

export function AuthForm({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [signInState, signIn, signingIn] = useActionState<AuthState, FormData>(signInAction, {});
  const [signUpState, signUp, signingUp] = useActionState<AuthState, FormData>(signUpAction, {});

  const isSignIn = mode === "signin";
  const state = isSignIn ? signInState : signUpState;
  const busy = isSignIn ? signingIn : signingUp;
  const action = isSignIn ? signIn : signUp;
  const idPrefix = isSignIn ? "signin" : "signup";

  if (state.notice) {
    return <div role="status" className="review-form-done">
      <Mail size={17} className="shrink-0" />
      <div>
        <p className="font-medium">Almost there</p>
        <p className="mt-1 text-xs leading-5">{state.notice}</p>
      </div>
    </div>;
  }

  return <div>
    <div className="flex rounded-lg border border-[#eaeaea] p-1">
      {(["signin", "signup"] as Mode[]).map((entry) => <button key={entry} type="button" onClick={() => setMode(entry)} aria-pressed={mode === entry} className={`h-9 flex-1 rounded-md text-sm font-medium transition-colors ${mode === entry ? "bg-[#f1f1f1] text-[#222]" : "text-[#666] hover:bg-[#fafafa]"}`}>{entry === "signin" ? "Sign in" : "Create account"}</button>)}
    </div>

    <form action={action} className="mt-5">
      <input type="hidden" name="next" value={nextPath} />
      <div className="grid gap-4">
        <label className="contact-field" htmlFor={`${idPrefix}-email`}><span>Email address</span><Input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" className="contact-input" /></label>
        <label className="contact-field" htmlFor={`${idPrefix}-password`}><span>Password</span><Input id={`${idPrefix}-password`} name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} required minLength={8} placeholder={isSignIn ? "Enter your password" : "At least 8 characters"} className="contact-input" /></label>
      </div>

      {state.error && <p className="field-error mt-3" role="alert">{state.error}</p>}

      <button type="submit" disabled={busy} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
        {busy ? <><LoaderCircle size={15} className="animate-spin" />{isSignIn ? "Signing in…" : "Creating account…"}</> : isSignIn ? "Sign in" : "Create account"}
      </button>
    </form>

    {mode === "signin" && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#777]"><CircleAlert size={14} className="mt-0.5 shrink-0" />Ordered as a guest? Track it with your order number and phone from the <a href="/orders" className="font-medium text-[#222] underline underline-offset-2">order tracking page</a>.</p>}
  </div>;
}
