// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    async function finish() {
      // Pass NEXT_PUBLIC values here — these are embedded at build time and safe for client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
      );

      // This parses tokens from the URL hash and sets the browser session
      const { error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error("Error completing sign-in:", error);
        setStatus("error");
        return;
      }

      setStatus("ok");
      router.replace("/");
    }

    finish();
  }, [router]);

  if (status === "loading") return <p>Completing sign in...</p>;
  if (status === "error") return <p>Could not complete sign-in.</p>;
  return null;
}
