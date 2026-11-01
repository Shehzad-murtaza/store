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

  if (isAdminPath && isLoginPath && user) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin";
    destination.search = "";
    const redirectResponse = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAdminPath && !isLoginPath && !user) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin/login";
    destination.search = "";
    destination.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAdminPath && !isLoginPath) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  }
  return response;
}
