import { NextResponse, type NextRequest } from "next/server";

// Routes that require an authenticated user.
const PROTECTED_PREFIXES = ["/dashboard", "/calculator", "/loads", "/settings"];

// Routes that an authenticated user should NOT see (bounce them to /dashboard).
const AUTH_ONLY_PREFIXES = ["/login"];

// Cheap auth heuristic: does the request carry any Supabase auth cookie?
// Supabase stores session as `sb-<project-ref>-auth-token` (sometimes split
// into chunks like `.0`, `.1`). The page-level supabase.auth.getUser() call is
// what actually verifies the session — middleware just gates obvious cases.
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
      if (cookie.value && cookie.value.length > 0) return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthOnly) {
    return NextResponse.next();
  }

  const authed = hasSupabaseAuthCookie(request);

  if (isProtected && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/__debug-env|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
