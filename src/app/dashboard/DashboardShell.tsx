"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, History, FileText, PenLine,
  BarChart3, CreditCard, Settings, LogOut,
  Menu, Sun, Moon, ChevronRight, AlertTriangle, Zap,
  PanelLeftClose,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserProfile {
  name: string;
  email: string;
  credits: number;
  initial: string;
  avatarUrl?: string;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { id: "dashboard",   label: "Dashboard",    href: "/dashboard",            icon: LayoutDashboard },
      { id: "history",     label: "History",       href: "/history",              icon: History         },
      { id: "resumes",     label: "My Resumes",    href: "/dashboard/resumes",    icon: FileText        },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { id: "cover-letter", label: "Cover Letter",   href: "/dashboard/cover-letter", icon: PenLine   },
      { id: "interview",    label: "Interview Prep",  href: "/dashboard/interview",   icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing",  label: "Credits & Billing", href: "/billing",  icon: CreditCard },
      { id: "settings", label: "Settings",           href: "/settings", icon: Settings   },
    ],
  },
];

function LogoMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserAvatar({ profile, size = "sm", isDark }: { profile: UserProfile | null; size?: "sm" | "md"; isDark: boolean }) {
  const dim = size === "md" ? "w-8 h-8 text-sm" : "w-7 h-7 text-xs";
  return (
    <div className={cn(
      "rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 select-none",
      dim,
      !profile?.avatarUrl && (isDark ? "bg-zinc-700 text-zinc-200" : "bg-zinc-200 text-zinc-800")
    )}>
      {profile?.avatarUrl
        ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        : (profile?.initial ?? "U")
      }
    </div>
  );
}

function SidebarContent({
  profile, activeId, collapsed, onNavigate, onSignOut, signingOut, isDark, onToggleCollapse,
}: {
  profile: UserProfile | null;
  activeId: string;
  collapsed: boolean;
  onNavigate: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  isDark: boolean;
  onToggleCollapse: () => void;
}) {
  const lowCredits = (profile?.credits ?? 0) < 2;

  return (
    <div className="flex flex-col h-full">

      {/* Header: avatar + name / collapse toggle */}
      <div className={cn(
        "flex items-center h-14 border-b border-border shrink-0",
        collapsed ? "justify-center px-2" : "gap-2.5 px-4"
      )}>
        {collapsed ? (
          <button onClick={onToggleCollapse} title="Expand sidebar" className="flex items-center justify-center">
            <UserAvatar profile={profile} isDark={isDark} />
          </button>
        ) : (
          <>
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 flex-1 min-w-0">
              <UserAvatar profile={profile} size="md" isDark={isDark} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                  {profile?.name ?? "Loading…"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  {profile?.email ?? ""}
                </p>
              </div>
            </Link>
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
                isDark ? "text-zinc-600 hover:text-zinc-300 hover:bg-white/8" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              )}
            >
              <PanelLeftClose size={14} />
            </button>
          </>
        )}
      </div>

      {/* Low credits warning */}
      {lowCredits && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 flex items-start gap-2">
          <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {profile?.credits === 0 ? "No credits left" : "1 credit remaining"}
            </p>
            <Link href="/billing" onClick={onNavigate} className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Top up now →
            </Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2 mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
                {section.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-border/50 mb-3 mx-1" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-xl text-[13px] font-medium transition-all group",
                      collapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : isDark
                          ? "text-zinc-400 hover:text-white hover:bg-white/8"
                          : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                    )}
                  >
                    <Icon size={15} className={cn("shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    {!collapsed && <span className="leading-none flex-1">{item.label}</span>}
                    {!collapsed && isActive && <ChevronRight size={11} className="text-white/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-border shrink-0", collapsed ? "px-2 py-3 flex flex-col items-center gap-2" : "px-3 py-3 space-y-2")}>
        {!collapsed && (
          <Link
            href="/billing"
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-[12px]",
              isDark ? "border-white/8 bg-white/4 hover:bg-white/8" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
            )}
          >
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-blue-500" />
              <span className="font-medium text-foreground">Credits</span>
            </div>
            <span className={cn("font-bold tabular-nums", lowCredits ? "text-amber-500" : "text-foreground")}>
              {profile?.credits ?? "—"}
            </span>
          </Link>
        )}

        {collapsed && (
          <Link href="/billing" onClick={onNavigate} title="Credits & Billing"
            className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
              isDark ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/8" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            )}>
            <Zap size={15} className="text-blue-500" />
          </Link>
        )}

        <button
          onClick={onSignOut}
          disabled={signingOut}
          title="Sign out"
          className={cn(
            "flex items-center justify-center rounded-xl transition-colors disabled:opacity-50",
            collapsed
              ? "w-9 h-9"
              : "w-full h-8 gap-2 text-[12px] font-medium",
            isDark ? "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10" : "text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
          )}
        >
          <LogOut size={13} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

function SignOutConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isDark,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}) {
  if (!open) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border p-6 shadow-2xl",
          isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
        )}
      >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", isDark ? "bg-rose-500/15" : "bg-rose-50")}>
          <LogOut size={18} className="text-rose-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">Sign out?</h3>
        <p className="text-sm text-muted-foreground mb-5">You'll need to sign in again to access your account.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={cn(
              "flex-1 h-9 rounded-xl border text-sm font-medium transition-colors",
              isDark ? "border-white/10 text-zinc-300 hover:bg-white/8" : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") setCollapsed(true);
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("credits, full_name").eq("id", user.id).maybeSingle();
      const name = data?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
      setProfile({
        name,
        email: user.email ?? "",
        credits: data?.credits ?? 0,
        initial: name[0]?.toUpperCase() ?? "U",
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOutClick = () => setSignOutConfirmOpen(true);

  const handleSignOutConfirm = async () => {
    setSignOutConfirmOpen(false);
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isDark = mounted && resolvedTheme === "dark";

  const activeId = (() => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.startsWith("/history")) return "history";
    if (pathname.startsWith("/dashboard/resumes")) return "resumes";
    if (pathname.startsWith("/dashboard/cover-letter")) return "cover-letter";
    if (pathname.startsWith("/dashboard/interview")) return "interview";
    if (pathname.startsWith("/billing")) return "billing";
    if (pathname.startsWith("/settings")) return "settings";
    return "dashboard";
  })();

  const sidebarProps = {
    profile, activeId, collapsed, isDark,
    onNavigate: () => setMobileOpen(false),
    onSignOut: handleSignOutClick,
    signingOut,
    onToggleCollapse: handleToggleCollapse,
  };

  return (
    <>
    <AnimatePresence>
      {signOutConfirmOpen && (
        <SignOutConfirmDialog
          open={signOutConfirmOpen}
          onConfirm={handleSignOutConfirm}
          onCancel={() => setSignOutConfirmOpen(false)}
          isDark={isDark}
        />
      )}
    </AnimatePresence>
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col shrink-0 border-r border-border transition-[width] duration-200 ease-in-out overflow-hidden",
        collapsed ? "w-[60px]" : "w-60",
        isDark ? "bg-zinc-950" : "bg-white"
      )}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border md:hidden",
                isDark ? "bg-zinc-950" : "bg-white"
              )}
            >
              <SidebarContent {...sidebarProps} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className={cn(
          "h-14 shrink-0 flex items-center justify-between px-5 border-b border-border",
          isDark ? "bg-zinc-950" : "bg-white"
        )}>
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle sidebar"
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isDark ? "text-zinc-400 hover:text-white hover:bg-white/8" : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              )}
            >
              <Menu size={17} />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", isDark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white")}>
                <LogoMark />
              </div>
              <span className="text-[14px] font-bold text-foreground">ResumAI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            {pathname !== "/dashboard" && (
              <>
                <ChevronRight size={12} />
                <span className="text-foreground font-medium capitalize">
                  {pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") ?? ""}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/billing"
              className={cn(
                "md:hidden flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-bold border transition-colors",
                isDark ? "border-white/10 bg-white/6 text-zinc-300" : "border-zinc-200 bg-zinc-50 text-zinc-700"
              )}
            >
              <Zap size={10} className="text-blue-500" />
              {profile?.credits ?? "—"}
            </Link>

            {mounted && (
              <button
                onClick={() => {
                  const next = isDark ? "light" : "dark";
                  const doc = document as unknown as { startViewTransition?: (cb: () => void) => void };
                  if (doc.startViewTransition) doc.startViewTransition(() => setTheme(next));
                  else setTheme(next);
                }}
                aria-label="Toggle theme"
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isDark
                    ? "bg-white/6 hover:bg-white/12 border border-white/10 text-zinc-400"
                    : "bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ opacity: 0, rotate: -20 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
