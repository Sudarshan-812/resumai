"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // FIXED: App Router compatible
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // FIXED: Supabase v2 compatible session check
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) throw error;
        
        if (session) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login?error=auth_failed");
      });
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
        Establishing Secure Session...
      </p>
    </div>
  );
}