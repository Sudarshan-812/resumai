"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    async function finish() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
      );

      // 🚨 FIXED: In Supabase v2, getSession() automatically reads the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error completing sign-in:", error.message);
        setStatus("error");
        return;
      }

      if (session) {
        setStatus("ok");
        router.replace("/dashboard");
      } else {
        setStatus("error");
        setTimeout(() => router.replace("/login?error=auth_failed"), 2000);
      }
    }

    finish();
  }, [router]);

  if (status === "loading" || status === "ok") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
          Establishing Secure Session...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-4" />
        <p className="text-sm font-mono uppercase tracking-widest text-rose-500">
          Authentication Pipeline Failed
        </p>
      </div>
    );
  }

  return null;
}