"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  SignOut as LogOut, CreditCard, EnvelopeSimple as Mail, User, ShieldCheck, Pencil,
  Check, X, Key as KeyRound, Trash as Trash2, ArrowRight,
} from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";

/* ─── Building blocks ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-medium text-foreground mb-2">{children}</h2>
  );
}

function Row({ children, last = false }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 h-14 ${last ? "" : "border-b border-border"}`}>
      {children}
    </div>
  );
}

function RowLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <Icon size={16} className="text-muted-foreground" />
      <span className="text-[13px] font-medium text-foreground">{label}</span>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email?: string; app_metadata?: { provider?: string }; user_metadata?: { avatar_url?: string; picture?: string } } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; credits?: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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
      setProfile((prev) => (prev ? { ...prev, full_name: trimmed } : prev));
      setEditingName(false);
      toast.success("Display name updated.");
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }, [nameInput, user, supabase]);

  const handleResetPassword = useCallback(async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Reset link sent - check your inbox.");
    } catch {
      toast.error("Failed to send reset email.");
    } finally {
      setSendingReset(false);
    }
  }, [user, supabase]);

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

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      toast.success("Account deleted.");
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account. Contact support.");
      setDeleting(false);
    }
  }, [deleteConfirm]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 md:px-8 py-8">
        <div className="h-6 w-32 rounded bg-muted mb-2" />
        <div className="h-3.5 w-64 rounded bg-muted mb-8" />
        <div className="space-y-6">
          {[0, 1, 2].map((s) => (
            <div key={s} className="rounded-lg border border-border overflow-hidden">
              {[0, 1].map((i) => (
                <div key={i} className={`flex items-center justify-between px-4 h-14 ${i === 0 ? "border-b border-border" : ""}`}>
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName[0]?.toUpperCase() ?? "U";
  const credits = profile?.credits ?? 0;
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const provider = user?.app_metadata?.provider;
  const isEmailAuth = !provider || provider === "email";

  return (
    <div className="mx-auto max-w-2xl px-6 md:px-8 py-8">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Manage your account, credits, and security.</p>
      </div>

      {/* Identity card */}
      <div className="rounded-lg border border-border p-4 flex items-center gap-3.5 mb-8">
        <span className="shrink-0 w-11 h-11 rounded-full overflow-hidden bg-primary flex items-center justify-center text-[15px] font-semibold text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-[12.5px] text-muted-foreground truncate">{user?.email}</p>
        </div>
        <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-[12px] text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      {/* Profile */}
      <div className="mb-8">
        <SectionLabel>Profile</SectionLabel>
        <div className="rounded-lg border border-border overflow-hidden">
          <Row>
            <RowLabel icon={Mail} label="Email" />
            <span className="text-[13px] text-muted-foreground truncate max-w-[220px]">{user?.email}</span>
          </Row>

          <div className="flex items-center justify-between gap-4 px-4 h-14 border-b border-border">
            <RowLabel icon={User} label="Display name" />
            {editingName ? (
              <div className="flex items-center gap-2 flex-1 max-w-[280px]">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  placeholder="Your name"
                  className="flex-1 h-8 px-2.5 rounded-md text-[13px] bg-white border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !nameInput.trim()}
                  className="shrink-0 w-8 h-8 rounded-md bg-primary hover:bg-[#0f9184] flex items-center justify-center disabled:opacity-40 transition-colors"
                >
                  {savingName ? <CoinLoader size={13} className="text-white" /> : <Check size={13} weight="bold" className="text-white" />}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="shrink-0 w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-[#f8f8f9] flex items-center justify-center transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">{displayName}</span>
                <button
                  onClick={() => { setNameInput(profile?.full_name || ""); setEditingName(true); }}
                  className="w-7 h-7 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] flex items-center justify-center transition-colors"
                  aria-label="Edit display name"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>

          <Row last>
            <RowLabel icon={ShieldCheck} label="Account status" />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </Row>
        </div>
      </div>

      {/* Credits */}
      <div className="mb-8">
        <SectionLabel>Credits &amp; plan</SectionLabel>
        <div className="rounded-lg border border-border overflow-hidden">
          <Row last>
            <RowLabel icon={CreditCard} label="Credits remaining" />
            <div className="flex items-center gap-4">
              <span
                className="text-[18px] font-semibold tabular-nums leading-none"
                style={{ color: credits <= 2 ? "#d97706" : "#12a594" }}
              >
                {credits}
              </span>
              <Link href="/billing" className="inline-flex items-center gap-0.5 text-[12px] font-medium text-primary hover:underline">
                Buy more <ArrowRight size={12} />
              </Link>
            </div>
          </Row>
          <div className="px-4 py-3 border-t border-border">
            <div className="w-full h-1 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((credits / 30) * 100, 100)}%`,
                  background: credits <= 2 ? "#d97706" : "#12a594",
                }}
              />
            </div>
            <p className="text-[11.5px] mt-1.5 text-muted-foreground">{credits} of 30 maximum credits</p>
          </div>
        </div>
      </div>

      {/* Security */}
      {isEmailAuth && (
        <div className="mb-8">
          <SectionLabel>Security</SectionLabel>
          <div className="rounded-lg border border-border overflow-hidden">
            <Row last>
              <RowLabel icon={KeyRound} label="Password" />
              {resetSent ? (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
                  <Check size={14} weight="bold" /> Reset email sent
                </span>
              ) : (
                <button
                  onClick={handleResetPassword}
                  disabled={sendingReset}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  {sendingReset ? <><CoinLoader size={13} className="text-current" /> Sending...</> : "Send reset email"}
                </button>
              )}
            </Row>
          </div>
        </div>
      )}

      {/* Account actions */}
      <div className="mb-8">
        <SectionLabel>Account actions</SectionLabel>
        <div className="rounded-lg border border-border overflow-hidden">
          <Row last>
            <RowLabel icon={LogOut} label="Session" />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {signingOut ? <><CoinLoader size={13} className="text-current" /> Signing out...</> : <><LogOut size={13} /> Sign out</>}
            </button>
          </Row>
        </div>

        {/* Danger */}
        <div className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/[0.02] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Trash2 size={16} className="text-rose-600/80" />
              <span className="text-[13px] font-medium text-rose-700">Delete account</span>
            </div>
            {!showDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
              >
                Delete my account
              </button>
            )}
          </div>

          <AnimatePresence>
            {showDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <p className="text-[12.5px] leading-relaxed text-rose-700/80">
                    This permanently deletes all your resumes, analyses, and account data. This action{" "}
                    <strong className="text-rose-700">cannot be undone</strong>.
                  </p>
                  <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-rose-600/70">
                    Type DELETE to confirm
                  </p>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") { setShowDelete(false); setDeleteConfirm(""); } }}
                    placeholder="DELETE"
                    className="w-full max-w-[240px] h-9 px-3 rounded-md text-[13px] bg-white border border-rose-500/30 text-rose-700 placeholder:text-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 transition-all"
                  />
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE" || deleting}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12.5px] font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-35 disabled:pointer-events-none transition-colors"
                    >
                      {deleting ? <><CoinLoader size={13} className="text-current" /> Deleting...</> : <><Trash2 size={13} /> Delete my account</>}
                    </button>
                    <button
                      onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                      className="text-[12.5px] text-rose-600/70 hover:text-rose-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
