// src/app/lib/auth.ts
import { createBrowserClient, createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Client-side
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Server-side (for server components & route handlers)
export const createServerSupabase = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies
  );

// Get user (works in both server & client)
export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}