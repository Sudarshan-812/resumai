import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Singleton: several client components call createClient() directly in the
// render body (dashboard-navbar, DashboardShell, login/settings pages, etc).
// Without caching, each render/hot-reload spins up a new GoTrueClient,
// multiplying auth listeners and triggering Supabase's "Multiple GoTrueClient
// instances" warning + memory growth in dev.
export function createClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}