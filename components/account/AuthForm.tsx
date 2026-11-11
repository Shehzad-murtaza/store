"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isSignIn = mode === "signin";
  const idPrefix = isSignIn ? "signin" : "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password || (!isSignIn && password.length < 8)) {
      setError(isSignIn ? "Enter your password." : "Use a password of at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      if (isSignIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError("Email or password is incorrect.");
          return;
        }
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setNotice("Check your email to confirm your account, then sign in.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("We could not connect to your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (notice) {
    return <div role="status" className="review-form-done">
      <Mail size={17} className="shrink-0" />
      <div>
        <p className="font-medium">Almost there</p>
        <p className="mt-1 text-xs leading-5">{notice}</p>
      </div>
    </div>;
  }

  return <div>
    <div className="flex rounded-lg border border-[#eaeaea] p-1">
      {(["signin", "signup"] as Mode[]).map((entry) => <button key={entry} type="button" onClick={() => { setMode(entry); setError(""); setNotice(""); }} aria-pressed={mode === entry} className={`h-9 flex-1 rounded-md text-sm font-medium transition-colors ${mode === entry ? "bg-[#f1f1f1] text-[#222]" : "text-[#666] hover:bg-[#fafafa]"}`}>{entry === "signin" ? "Sign in" : "Create account"}</button>)}
    </div>

    <form onSubmit={handleSubmit} className="mt-5">
      <div className="grid gap-4">
        <label className="contact-field" htmlFor={`${idPrefix}-email`}><span>Email address</span><Input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" className="contact-input" /></label>
        <label className="contact-field" htmlFor={`${idPrefix}-password`}><span>Password</span><Input id={`${idPrefix}-password`} name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} required minLength={8} placeholder={isSignIn ? "Enter your password" : "At least 8 characters"} className="contact-input" /></label>
      </div>

      {error && <p className="field-error mt-3" role="alert">{error}</p>}

      <button type="submit" disabled={busy} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-60">
        {busy ? <><LoaderCircle size={15} className="animate-spin" />{isSignIn ? "Signing in…" : "Creating account…"}</> : isSignIn ? "Sign in" : "Create account"}
      </button>
    </form>

    {mode === "signin" && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#777]"><CircleAlert size={14} className="mt-0.5 shrink-0" />Ordered as a guest? Track it with your order number and phone from the <a href="/orders" className="font-medium text-[#222] underline underline-offset-2">order tracking page</a>.</p>}
  </div>;
}
