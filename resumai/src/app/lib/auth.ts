import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 1. Client-side Creator (Browser)
// This remains synchronous as it doesn't need to read server cookies directly
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// 2. Server-side Creator (Server Components, Actions, & Route Handlers)
// FIXED: This MUST be async to await the cookies() Promise in Next.js 15+
export const createServerSupabase = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The setAll method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
};

// 3. Get User Helper (Server-side optimized)
export async function getUser() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error("Auth helper error:", err);
    return null;
  }
}