import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require an authenticated user. Route groups like (protected)
// don't appear in the URL, so we gate by actual path segments.
const PROTECTED_PREFIXES = ["/dashboard", "/calculator", "/loads", "/settings"];

// Routes that an authenticated user should NOT see (bounce them to /dashboard).
const AUTH_ONLY_PREFIXES = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Defensive: if env vars are missing or empty at runtime, skip auth
    // entirely rather than 500. This will let the page render with no session.
    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "[middleware] Missing Supabase env vars",
        JSON.stringify({
          hasUrl: !!supabaseUrl,
          urlLen: supabaseUrl?.length ?? 0,
          hasKey: !!supabaseKey,
          keyLen: supabaseKey?.length ?? 0,
          pathname,
        })
      );
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh the session cookie if expired.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthOnly && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    // Log the real error so we can see it in Vercel runtime logs, but don't
    // crash the request — let the page render unauthenticated.
    console.error(
      "[middleware] Unhandled error",
      err instanceof Error ? err.message : String(err),
      err instanceof Error ? err.stack : undefined
    );
    return NextResponse.next({ request });
  }
}

export const config = {
  // Skip static assets, the auth callback, and the debug route.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/__debug-env|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).