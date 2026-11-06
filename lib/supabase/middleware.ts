import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  // Public pages should not wait for a Supabase auth round trip. The storefront
  // resolves its optional Dashboard control asynchronously in the header.
  if (!isAdminPath) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isLoginPath = pathname === "/admin/login";

  function redirectTo(targetPath: string, nextValue?: string) {
    const destination = request.nextUrl.clone();
    destination.pathname = targetPath;
    destination.search = "";
    if (nextValue) destination.searchParams.set("next", nextValue);
    const redirectResponse = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (user) {
    // Signing in is not enough; admin routes belong to the store owner only.
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) return redirectTo("/");
    if (isLoginPath) return redirectTo("/admin");
  } else if (!isLoginPath) {
    return redirectTo("/admin/login", `${pathname}${request.nextUrl.search}`);
  }

  if (!isLoginPath) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  }
  return response;
}
