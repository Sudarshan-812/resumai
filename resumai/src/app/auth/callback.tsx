// src/pages/auth/callback.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth
      .getSessionFromUrl()
      .then(({ error }) => {
        if (error) throw error;
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/login?error=1");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-xl text-slate-600">Completing sign-in...</p>
    </div>
  );
}