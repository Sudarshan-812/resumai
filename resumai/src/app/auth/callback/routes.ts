// src/app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server route that handles the OAuth callback from Supabase.
 *
 * Notes:
 * - This is a template that wires cookies to Supabase's SSR client.
 * - Depending on your Supabase client version, you'll need to call the proper
 *   exchange/finish method to turn the URL code into a session and set cookies.
 *
 * Examples you might need to call here (depending on lib/version):
 * - supabase.auth.exchangeCodeForSession(url)         // some versions
 * - supabase.auth.getSessionFromUrl({ url })         // some versions
 *
 * The call below is intentionally left as a placeholder `TODO` since method
 * names evolve across helper packages. Replace the placeholder with your
 * client-specific exchange method, then return the redirect.
 */

export async function GET(req: Request) {
  // Create SSR client bound to response cookies
  const cookieStore = cookies();
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
            // Called from a Server Component that cannot set cookies — ignore.
          }
        },
      },
    }
  );

  try {
    const url = req.url;

    // -----------------------------
    // TODO: Replace the next line with the correct exchange call for your Supabase version.
    // Example placeholders:
    // await supabase.auth.getSessionFromUrl({ url });          // v2-ish helper
    // await supabase.auth.exchangeCodeForSession(url);         // other helpers
    // -----------------------------

    // Example: if your supabase client has getSessionFromUrl:
    // if (typeof supabase.auth.getSessionFromUrl === "function") {
    //   await supabase.auth.getSessionFromUrl({ url });
    // }

    // If you need to inspect query parameters you can:
    // const parsed = new URL(url);
    // const code = parsed.searchParams.get("code");
    // (then call the proper supabase exchange function)

    // After you finish the exchange, Supabase will set proper cookies through `cookies.set`
    // and the user will be authenticated on subsequent server requests.

  } catch (err) {
    // Log but continue to redirect the user — show them the UI error on dashboard if needed.
    console.error("Auth callback error:", err);
  }

  // Redirect to dashboard (or use the "redirect_to" param)
  const redirectUrl = "/dashboard";
  return NextResponse.redirect(redirectUrl);
}
