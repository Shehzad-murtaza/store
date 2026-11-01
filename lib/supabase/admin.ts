import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Require a valid Supabase Auth session for protected admin routes. */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  return user;
}
