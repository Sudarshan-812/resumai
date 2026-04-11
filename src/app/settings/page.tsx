"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, CreditCard, Mail, User, ShieldCheck, Pencil, Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser]       = useState<{ id: string; email?: string; user_metadata?: { avatar_url?: string; picture?: string } } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; credits?: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [editingName, setEditingName]   = useState(false);
  const [nameInput, setNameInput]       = useState("");
  const [savingName, setSavingName]     = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("credits, full_name").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSaveName = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !user) return;
    setSavingName(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: trimmed }).eq("id", user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: trimmed } : prev);
      setEditingName(false);
      toast.success("Display name updated.");
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }, [nameInput, user, supabase]);

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
      <DashboardShell>
        <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
            <div className="space-y-2 flex-1"><Skeleton className="h-4 w-32 rounded" /><Skeleton className="h-3 w-48 rounded" /></div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><Skeleton className="h-4 w-4 rounded" /><Skeleton className="h-4 w-24 rounded" /></div>
              <Skeleton className="h-4 w-36 rounded" />
            </div>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const name     = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initial  = name[0]?.toUpperCase() ?? "U";
  const credits  = profile?.credits ?? 0;
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const rowBase = "bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-3";
  const delay = (n: number) => ({ delay: n * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const });

  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">

        <div className="mb-2">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences.</p>
        </div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={delay(0)} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-900 text-white flex items-center justify-center text-xl font-bold shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-[15px] truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={delay(1)} className={rowBase}>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail size={14} /><span className="text-sm font-medium text-foreground">Email</span>
          </div>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
        </motion.div>

        {/* Display name (editable) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={delay(2)} className={rowBase}>
          <div className="flex items-center gap-3 text-muted-foreground shrink-0">
            <User size={14} /><span className="text-sm font-medium text-foreground">Display name</span>
          </div>
          {editingName ? (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                className="h-8 max-w-[160px] rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button onClick={handleSaveName} disabled={savingName || !nameInput.trim()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-50 transition-all">
                {savingName ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              </button>
              <button onClick={() => setEditingName(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground truncate max-w-[160px]">{name}</span>
              <button
                onClick={() => { setNameInput(name); setEditingName(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label="Edit display name"
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Account status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={delay(3)} className={rowBase}>
          <div className="flex items-center gap-3 text-muted-foreground">
            <ShieldCheck size={14} /><span className="text-sm font-medium text-foreground">Account status</span>
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Active</span>
        </motion.div>

        {/* Credits */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={delay(4)} className={rowBase}>
          <div className="flex items-center gap-3 text-muted-foreground">
            <CreditCard size={14} /><span className="text-sm font-medium text-foreground">Credits remaining</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground tabular-nums">{credits}</span>
            <Link href="/billing" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Buy more</Link>
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={delay(5)}>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full h-11 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </motion.div>

      </div>
    </DashboardShell>
  );
}
