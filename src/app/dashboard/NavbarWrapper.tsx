"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import DashboardNavbar from "./dashboard-navbar";

export default function NavbarWrapper() {
  const [userProfile, setUserProfile] = useState<{
    name: string; email: string; credits: number; initial: string; avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("credits, full_name")
        .eq("id", user.id)
        .single();
      const name = data?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
      setUserProfile({
        name,
        email: user.email || "",
        credits: data?.credits ?? 0,
        initial: name[0]?.toUpperCase() ?? "U",
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      });
    })();
  }, []);

  if (!userProfile) return null;
  return <DashboardNavbar userProfile={userProfile} />;
}
