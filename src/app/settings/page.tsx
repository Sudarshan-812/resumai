"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, CreditCard, Mail, User, ShieldCheck, Pencil,
  Check, X, Loader2, KeyRound, Trash2, ChevronRight,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";

const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

/* ─── Underline input ─────────────────────────────────────────── */
function UInput({
  autoFocus = false, value, onChange, onKeyDown, placeholder,
}: {
  autoFocus?: boolean;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full py-1.5 text-[14px] bg-transparent focus:outline-none placeholder:text-[#C8C4BB]"
        style={{ color: "#111111", borderBottom: `1px solid ${focused ? "#06b6d4" : "#C8C4BB"}`, transition: "border-color 0.2s" }}
      />
      {focused && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          style={{ background: "#06b6d4" }}
          transition={{ duration: 0.22, ease: EASE }}
        />
      )}
    </div>
  );
}

/* ─── Section label ───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-5" style={{ color: "#9B9890" }}>
      {children}
    </p>
  );
}

/* ─── Row ─────────────────────────────────────────────────────── */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4" style={{ borderBottom: "1px solid #E5E3DC" }}>
      {children}
    </div>
  );
}

function RowLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <Icon size={13} strokeWidth={1.7} style={{ color: "#C8C4BB" }} />
      <span className="text-[13px] font-medium" style={{ color: "#6B6860" }}>{label}</span>
    </div>
  );
}

/* ─── Count-up ────────────────────────────────────────────────── */
function CountUp({ to, color = "#111111" }: { to: number; color?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return (
    <span
      className="tabular-nums font-bold"
      style={{ color, fontSize: 24, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" } as React.CSSProperties}
    >
      {val}
    </span>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,    setUser]    = useState<{ id: string; email?: string; app_metadata?: { provider?: string }; user_metadata?: { avatar_url?: string; picture?: string } } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; credits?: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  /* name editing */
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState("");
  const [savingName,  setSavingName]  = useState(false);

  /* password reset */
  const [sendingReset,  setSendingReset]  = useState(false);
  const [resetSent,     setResetSent]     = useState(false);

  /* sign out */
  const [signingOut, setSigningOut] = useState(false);

  /* delete account */
  const [showDelete,      setShowDelete]      = useState(false);
  const [deleteConfirm,   setDeleteConfirm]   = useState("");
  const [deleting,        setDeleting]        = useState(false);
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

  const handleResetPassword = useCallback(async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Reset link sent — check your inbox.");
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
      toast.success("Account deleted. Goodbye.");
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account. Contact support.");
      setDeleting(false);
    }
  }, [deleteConfirm]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <DashboardShell>
        <div style={{ background: "#F7F6F2", minHeight: "100%" }}>
          <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
            <div className="max-w-xl mx-auto px-6 md:px-10 pt-10 pb-8">
              <div className="h-3 w-16 rounded mb-4" style={{ background: "#E5E3DC" }} />
              <div className="h-8 w-32 rounded mb-3" style={{ background: "#E5E3DC" }} />
              <div className="h-4 w-48 rounded" style={{ background: "#E5E3DC" }} />
            </div>
          </div>
          <div className="max-w-xl mx-auto px-6 md:px-10 py-10 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E5E3DC" }}>
                <div className="h-3 w-24 rounded" style={{ background: "#E5E3DC" }} />
                <div className="h-3 w-32 rounded" style={{ background: "#E5E3DC" }} />
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initial     = displayName[0]?.toUpperCase() ?? "U";
  const credits     = profile?.credits ?? 0;
  const avatarUrl   = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const provider    = user?.app_metadata?.provider;
  const isEmailAuth = !provider || provider === "email";

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 260, damping: 26 },
  });

  return (
    <DashboardShell>
      <div style={{ background: "#F7F6F2", minHeight: "100%" }}>

        {/* ── White header ── */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>

          {/* Cyan accent stripe */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ height: 3, background: "linear-gradient(90deg,#06b6d4,#0891b2)", transformOrigin: "left" }}
          />

          <div className="max-w-xl mx-auto px-6 md:px-10 pt-8 pb-8">
            <motion.div {...stagger(0)}>
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: "#9B9890" }}>
                Account
              </p>
            </motion.div>

            {/* Avatar + name */}
            <motion.div {...stagger(1)} className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={SPRING}
                className="shrink-0 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl"
                style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(8,145,178,0.08))", border: "2px solid rgba(6,182,212,0.22)", color: "#06b6d4" }}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : initial
                }
              </motion.div>
              <div>
                <h1 className="font-display font-semibold tracking-tight"
                  style={{ color: "#111111", fontSize: "clamp(22px, 4vw, 32px)", lineHeight: 1.2 }}>
                  {displayName}
                </h1>
                <p className="text-[13px] mt-0.5" style={{ color: "#9B9890" }}>{user?.email}</p>
              </div>

              {/* Active badge */}
              <motion.div
                {...stagger(2)}
                className="ml-auto flex items-center gap-1.5 shrink-0"
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10b981" }}
                />
                <span className="text-[11px] font-mono" style={{ color: "#10b981" }}>Active</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Cream content ── */}
        <div className="max-w-xl mx-auto px-6 md:px-10 py-10">

          {/* ── Section: Account ── */}
          <motion.div {...stagger(2)} className="mb-10">
            <SectionLabel>Profile</SectionLabel>

            {/* Email */}
            <Row>
              <RowLabel icon={Mail} label="Email" />
              <span className="text-[13px] truncate max-w-[220px]" style={{ color: "#9B9890" }}>
                {user?.email}
              </span>
            </Row>

            {/* Display name */}
            <div className="py-4" style={{ borderBottom: "1px solid #E5E3DC" }}>
              <div className="flex items-center justify-between gap-4">
                <RowLabel icon={User} label="Display name" />

                <AnimatePresence mode="wait">
                  {editingName ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 flex-1 max-w-[260px]"
                    >
                      <div className="flex-1">
                        <UInput
                          autoFocus
                          value={nameInput}
                          onChange={setNameInput}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleSaveName();
                            if (e.key === "Escape") setEditingName(false);
                          }}
                          placeholder="Your name"
                        />
                      </div>
                      <motion.button
                        onClick={handleSaveName}
                        disabled={savingName || !nameInput.trim()}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)" }}
                      >
                        {savingName
                          ? <Loader2 size={11} className="animate-spin" style={{ color: "#FFF" }} />
                          : <Check size={11} strokeWidth={3} style={{ color: "#FFF" }} />
                        }
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingName(false)}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "#F0EFE9", color: "#9B9890" }}
                      >
                        <X size={11} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="display"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[13px]" style={{ color: "#111111" }}>{displayName}</span>
                      <motion.button
                        onClick={() => {
                          setNameInput(profile?.full_name || "");
                          setEditingName(true);
                        }}
                        whileHover={{ rotate: 18, scale: 1.12 }} whileTap={{ scale: 0.88 }}
                        transition={SPRING}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ border: "1px solid #E5E3DC", color: "#C8C4BB", background: "#FFFFFF" }}
                        aria-label="Edit display name"
                      >
                        <Pencil size={10} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Account status */}
            <Row>
              <RowLabel icon={ShieldCheck} label="Account status" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                <span className="text-[13px] font-medium" style={{ color: "#10b981" }}>Active</span>
              </div>
            </Row>
          </motion.div>

          {/* ── Section: Credits ── */}
          <motion.div {...stagger(3)} className="mb-10">
            <SectionLabel>Credits & Plan</SectionLabel>

            <Row>
              <RowLabel icon={CreditCard} label="Credits remaining" />
              <div className="flex items-center gap-4">
                <CountUp to={credits} color={credits <= 2 ? "#d97706" : "#06b6d4"} />
                <Link href="/billing">
                  <motion.span
                    whileHover={{ x: 2 }} transition={SPRING}
                    className="flex items-center gap-0.5 text-[11px] font-semibold"
                    style={{ color: "#06b6d4" }}
                  >
                    Buy more <ChevronRight size={10} />
                  </motion.span>
                </Link>
              </div>
            </Row>

            {/* Mini credit bar */}
            <div className="pt-2 pb-5">
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((credits / 30) * 100, 100)}%` }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: credits <= 2 ? "#d97706" : "linear-gradient(90deg,#06b6d4,#0891b2)" }}
                />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "#C8C4BB" }}>
                {credits} of 30 maximum credits
              </p>
            </div>
          </motion.div>

          {/* ── Section: Security (email users only) ── */}
          {isEmailAuth && (
            <motion.div {...stagger(4)} className="mb-10">
              <SectionLabel>Security</SectionLabel>

              <Row>
                <RowLabel icon={KeyRound} label="Password" />
                <AnimatePresence mode="wait">
                  {resetSent ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={SPRING}
                      className="flex items-center gap-1.5 text-[12px] font-medium"
                      style={{ color: "#10b981" }}
                    >
                      <Check size={12} strokeWidth={3} /> Reset email sent
                    </motion.div>
                  ) : (
                    <motion.button
                      key="btn"
                      onClick={handleResetPassword}
                      disabled={sendingReset}
                      whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} transition={SPRING}
                      className="text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-50"
                      style={{ color: "#6B6860" }}
                    >
                      {sendingReset
                        ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
                        : "Send reset email"
                      }
                    </motion.button>
                  )}
                </AnimatePresence>
              </Row>
            </motion.div>
          )}

          {/* ── Section: Danger zone ── */}
          <motion.div {...stagger(5)}>
            <SectionLabel>Account actions</SectionLabel>

            {/* Sign out */}
            <Row>
              <RowLabel icon={LogOut} label="Session" />
              <motion.button
                onClick={handleSignOut}
                disabled={signingOut}
                whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} transition={SPRING}
                className="text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
                style={{ color: "#dc2626" }}
              >
                {signingOut
                  ? <><Loader2 size={11} className="animate-spin" /> Signing out…</>
                  : <><LogOut size={11} /> Sign out</>
                }
              </motion.button>
            </Row>

            {/* Delete account */}
            <div className="py-4">
              <div className="flex items-center justify-between gap-4" style={showDelete ? {} : { borderBottom: "1px solid #E5E3DC" }}>
                <RowLabel icon={Trash2} label="Delete account" />
                <motion.button
                  onClick={() => setShowDelete(true)}
                  whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} transition={SPRING}
                  className="text-[12px] font-medium"
                  style={{ color: showDelete ? "#9B9890" : "#dc2626", display: showDelete ? "none" : "block" }}
                >
                  Delete my account
                </motion.button>
              </div>

              <AnimatePresence>
                {showDelete && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    className="overflow-hidden"
                    style={{ borderBottom: "1px solid #E5E3DC" }}
                  >
                    <div className="pt-4 pb-5 space-y-4">
                      <p className="text-[12px] leading-relaxed" style={{ color: "#9B9890" }}>
                        This permanently deletes all your resumes, analyses, and account data.
                        This action <strong style={{ color: "#6B6860" }}>cannot be undone</strong>.
                      </p>
                      <p className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: "#C8C4BB" }}>
                        Type DELETE to confirm
                      </p>
                      <div style={{ maxWidth: 240 }}>
                        <UInput
                          value={deleteConfirm}
                          onChange={setDeleteConfirm}
                          placeholder="DELETE"
                          onKeyDown={e => { if (e.key === "Escape") { setShowDelete(false); setDeleteConfirm(""); } }}
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <motion.button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== "DELETE" || deleting}
                          whileHover={deleteConfirm === "DELETE" && !deleting ? { scale: 1.02 } : {}}
                          whileTap={deleteConfirm === "DELETE" && !deleting ? { scale: 0.97 } : {}}
                          transition={SPRING}
                          className="h-8 px-4 rounded-xl text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-30"
                          style={{ background: "#dc2626", color: "#FFFFFF" }}
                        >
                          {deleting
                            ? <><Loader2 size={11} className="animate-spin" /> Deleting…</>
                            : <><Trash2 size={11} /> Delete my account</>
                          }
                        </motion.button>
                        <motion.button
                          onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                          whileHover={{ x: 1 }} whileTap={{ scale: 0.95 }} transition={SPRING}
                          className="text-[12px]"
                          style={{ color: "#9B9890" }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>

          <div className="h-10" />
        </div>

      </div>
    </DashboardShell>
  );
}
