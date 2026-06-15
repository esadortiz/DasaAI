import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/security/redirects";
import type { Database } from "./types";

const protectedRoutes = ["/profile", "/roadmap", "/coach"];
const guestAuthRoutes = ["/login", "/register"];

function isRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function getInternalNext(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? request.nextUrl.searchParams.get("redirectTo");
  return safeInternalPath(next, "/profile");
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = isRoute(pathname, protectedRoutes);
  const isGuestAuthRoute = isRoute(pathname, guestAuthRoutes);

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && isGuestAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getInternalNext(request);
    redirectUrl.search = "";
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
