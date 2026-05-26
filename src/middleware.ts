import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createServerClient } from "@supabase/ssr";

// Issue 8: Initialise Redis only when env vars are present — crashes are prevented
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: false,
    })
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api/");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Skip middleware entirely for non-API, non-dashboard routes
  if (!isApiRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  // Build a mutable response so refreshed session cookies are forwarded
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Issue 4: Rate-limit by user ID when authenticated, IP as fallback
  if (isApiRoute && ratelimit) {
    const ip =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "127.0.0.1";
    const rateLimitKey = user?.id ?? ip;

    const { success, limit, remaining, reset } =
      await ratelimit.limit(rateLimitKey);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // Issue 2: Expanded auth guard — covers all sensitive API routes
  const isProtected =
    isDashboardRoute ||
    pathname.startsWith("/api/interview/") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/resume/") ||
    pathname.startsWith("/api/cover-letter") ||
    pathname.startsWith("/api/analyze/");

  if (isProtected && !user) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (Next.js build assets)
     * - _next/image   (image optimisation pipeline)
     * - favicon.ico
     * - Common static file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
