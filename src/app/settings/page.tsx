"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, CreditCard, Mail, User, ShieldCheck } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import NavbarWrapper from "@/app/dashboard/NavbarWrapper";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser]         = useState<any>(null);
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data } = await supabase.from("profiles").select("credits, full_name").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, [router, supabase]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      toast.error("Failed to sign out.");
      setSigningOut(false);
    }
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const name    = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initial = name[0]?.toUpperCase() ?? "U";
  const credits = profile?.credits ?? 0;
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavbarWrapper />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-12 space-y-4">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-foreground text-background flex items-center justify-center text-xl font-bold shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-base truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Info rows */}
        {[
          {
            icon: <Mail size={15} />,
            label: "Email",
            value: user?.email,
            delay: 0.05,
          },
          {
            icon: <User size={15} />,
            label: "Display name",
            value: name,
            delay: 0.1,
          },
          {
            icon: <ShieldCheck size={15} />,
            label: "Account status",
            value: "Active",
            valueClass: "text-emerald-600 dark:text-emerald-400",
            delay: 0.15,
          },
        ].map(row => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: row.delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-muted-foreground">
              {row.icon}
              <span className="text-sm font-medium text-foreground">{row.label}</span>
            </div>
            <span className={`text-sm font-medium truncate max-w-[200px] ${row.valueClass ?? "text-muted-foreground"}`}>
              {row.value}
            </span>
          </motion.div>
        ))}

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <CreditCard size={15} />
            <span className="text-sm font-medium text-foreground">Credits remaining</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground tabular-nums">{credits}</span>
            <Link href="/billing" className="text-xs font-bold text-primary hover:underline">
              Buy more
            </Link>
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full h-11 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogOut size={15} />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </motion.div>

      </main>
    </div>
  );
}
