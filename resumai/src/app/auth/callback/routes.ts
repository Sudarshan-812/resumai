import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  // "next" is the parameter Supabase uses to redirect after successful auth
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // 🚨 NEXT.JS 15 FIX: cookies() is now a Promise and MUST be awaited
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    try {
      // 🚨 ACTUAL IMPLEMENTATION: Exchange the code for a real session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Construct the full redirect URL safely
        const forwardTo = new URL(next, origin);
        return NextResponse.redirect(forwardTo);
      }
      
      console.error("Supabase Auth Exchange Error:", error.message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Auth callback exception:", errorMessage);
    }
  }

  // If the code exchange fails or no code exists, return to login with error state
  const errorUrl = new URL("/login?error=auth_failed", origin);
  return NextResponse.redirect(errorUrl);
}