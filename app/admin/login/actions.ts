"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

function safeAdminDestination(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/admin/") && value !== "/admin") return "/admin";
  try {
    const base = "https://shezy.invalid";
    const destination = new URL(value, base);
    if (destination.origin !== base || (destination.pathname !== "/admin" && !destination.pathname.startsWith("/admin/"))) return "/admin";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/admin";
  }
}

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const destination = safeAdminDestination(formData.get("next"));

  if (!email || !password) return { error: "Email or password is incorrect." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email or password is incorrect." };

  // Being able to sign in is not enough — only allowlisted accounts may manage the store.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "This account does not have administrator access." };
  }

  redirect(destination);
}
