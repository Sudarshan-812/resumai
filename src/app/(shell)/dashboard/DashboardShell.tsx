"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SquaresFour as LayoutDashboard, ClockCounterClockwise as History, FileText, PencilLine as PenLine,
  ChartBar as BarChart3, CreditCard, Gear as Settings, SignOut as LogOut,
  List as Menu, CaretRight as ChevronRight, Warning as AlertTriangle, Lightning as Zap,
  SidebarSimple as PanelLeftClose, GitBranch,
} from "@phosphor-icons/react";
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
      { id: "cover-letter", label: "Cover Letter",    href: "/dashboard/cover-letter", icon: PenLine    },
      { id: "interview",    label: "Interview Prep",  href: "/dashboard/interview",    icon: BarChart3  },
      { id: "versions",     label: "Resume Versions", href: "/dashboard/versions",     icon: GitBranch  },
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

function UserAvatar({ profile, size = "sm" }: { profile: UserProfile | null; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-9 h-9 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={cn("rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 select-none text-white ring-2 ring-white/60", dim)}
      style={{ background: !profile?.avatarUrl ? "#12a594" : undefined }}
    >
      {profile?.avatarUrl
        ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        : (profile?.initial ?? "U")
      }
    </div>
  );
}

function SidebarContent({
  profile, activeId, collapsed, onNavigate, onSignOut, signingOut, onToggleCollapse,
}: {
  profile: UserProfile | null;
  activeId: string;
  collapsed: boolean;
  onNavigate: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  onToggleCollapse: () => void;
}) {
  const lowCredits = (profile?.credits ?? 0) < 2;

  // Measured-position active pill (instead of Framer's layoutId shared-element
  // transition, which can miss its FLIP measurement across route-level Suspense
  // boundaries on dynamic routes in production).
  const navRef = useRef<HTMLElement>(null);
  const [pillRect, setPillRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const recompute = () => {
      const nav = navRef.current;
      const activeEl = nav?.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
      if (activeEl) {
        setPillRect({
          top: activeEl.offsetTop,
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
        });
      }
    };
    recompute();
    // Re-measure after the sidebar's own width transition (collapse/expand) settles.
    const t = setTimeout(recompute, 320);
    window.addEventListener("resize", recompute);
    return () => { clearTimeout(t); window.removeEventListener("resize", recompute); };
  }, [activeId, collapsed]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center h-14 shrink-0",
        collapsed ? "justify-center px-2" : "gap-2.5 px-4"
      )}>
        {collapsed ? (
          <button onClick={onToggleCollapse} title="Expand sidebar">
            <UserAvatar profile={profile} />
          </button>
        ) : (
          <>
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 flex-1 min-w-0">
              <UserAvatar profile={profile} size="md" />
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
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-black/[0.04]"
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        )}
      </div>

      {/* Low credits warning */}
      {lowCredits && !collapsed && (
        <div className="mx-3 mb-1 px-3 py-2.5 rounded-2xl border border-amber-400/40 bg-amber-50 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-amber-700">
              {profile?.credits === 0 ? "No credits left" : "1 credit remaining"}
            </p>
            <Link href="/billing" onClick={onNavigate} className="text-[11px] text-amber-600 hover:underline font-medium">
              Top up now →
            </Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav ref={navRef} className="relative flex-1 overflow-y-auto px-3 py-2 space-y-3.5">
        {pillRect && (
          <div
            aria-hidden
            className="absolute z-0 top-0 left-0 rounded-2xl bg-teal-500 shadow-md shadow-teal-500/25 pointer-events-none transition-[transform,width,height] duration-300 ease-out"
            style={{
              width: pillRect.width,
              height: pillRect.height,
              transform: `translate(${pillRect.left}px, ${pillRect.top}px)`,
              willChange: "transform",
            }}
          />
        )}
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">
                {section.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-border/60 mb-2.5 mx-1" />}
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
                    data-nav-id={item.id}
                    className={cn(
                      "relative z-10 flex items-center rounded-2xl text-[13px] font-medium transition-colors group",
                      collapsed ? "justify-center px-2.5 py-2" : "gap-3 px-3 py-2",
                      isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04]"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} className="shrink-0" />
                    {!collapsed && <span className="leading-none flex-1">{item.label}</span>}
                    {!collapsed && isActive && <ChevronRight size={14} className="text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("shrink-0", collapsed ? "px-2 py-3 flex flex-col items-center gap-2" : "px-3 py-3 space-y-2")}>
        {!collapsed && (
          <Link
            href="/billing"
            onClick={onNavigate}
            className="flex items-center justify-between px-3 py-2.5 rounded-2xl border border-border/70 bg-secondary hover:bg-border/40 transition-all text-[12px]"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} weight="fill" className="text-teal-500" />
              <span className="font-medium text-foreground">Credits</span>
            </div>
            <span className={cn("font-bold tabular-nums", lowCredits ? "text-amber-500" : "text-foreground")}>
              {profile?.credits ?? "-"}
            </span>
          </Link>
        )}

        {collapsed && (
          <Link href="/billing" onClick={onNavigate} title="Credits & Billing"
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-colors text-muted-foreground hover:text-foreground hover:bg-black/[0.04]">
            <Zap size={18} weight="fill" className="text-teal-500" />
          </Link>
        )}

        <button
          onClick={onSignOut}
          disabled={signingOut}
          title="Sign out"
          className={cn(
            "flex items-center justify-center rounded-2xl transition-colors disabled:opacity-50 text-muted-foreground hover:text-rose-600 hover:bg-rose-50",
            collapsed ? "w-10 h-10" : "w-full h-9 gap-2 text-[12px] font-medium"
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

function SignOutConfirmDialog({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
          <LogOut size={22} className="text-rose-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">Sign out?</h3>
        <p className="text-sm text-muted-foreground mb-5">You'll need to sign in again to access your account.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
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
  const [profile, setProfile]         = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [signingOut, setSigningOut]   = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
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

  const handleSignOutConfirm = async () => {
    setSignOutConfirmOpen(false);
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const activeId = (() => {
    if (pathname === "/dashboard")                  return "dashboard";
    if (pathname.startsWith("/history"))            return "history";
    if (pathname.startsWith("/dashboard/resumes"))  return "resumes";
    if (pathname.startsWith("/dashboard/cover-letter")) return "cover-letter";
    if (pathname.startsWith("/dashboard/interview")) return "interview";
    if (pathname.startsWith("/dashboard/versions"))  return "versions";
    if (pathname.startsWith("/billing"))            return "billing";
    if (pathname.startsWith("/settings"))           return "settings";
    return "dashboard";
  })();

  const sidebarProps = {
    profile, activeId, collapsed,
    onNavigate: () => setMobileOpen(false),
    onSignOut: () => setSignOutConfirmOpen(true),
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
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen bg-background overflow-hidden p-3 gap-3">
        {/* Desktop floating glass sidebar */}
        <aside className={cn(
          "hidden md:flex flex-col shrink-0 rounded-[28px] border border-border bg-white shadow-[0_8px_32px_rgba(18,20,24,0.08)] transition-[width] duration-300 ease-in-out overflow-hidden",
          collapsed ? "w-[76px]" : "w-[248px]"
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
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="fixed inset-y-3 left-3 z-50 w-64 flex flex-col rounded-[28px] border border-border/70 bg-white/90 backdrop-blur-2xl shadow-2xl md:hidden"
              >
                <SidebarContent {...sidebarProps} collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-[28px] border border-border/70 bg-card">
          {/* Top bar */}
          <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-border/70">
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle sidebar"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Menu size={22} />
              </button>
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/column8_black_transparent.png"
                  alt="Viva"
                  width={560}
                  height={217}
                  className="h-7 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-foreground font-medium capitalize">
                    {pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") ?? ""}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/billing"
                className="md:hidden flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold border border-border bg-background text-muted-foreground"
              >
                <Zap size={14} weight="fill" className="text-teal-500" />
                {profile?.credits ?? "-"}
              </Link>
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
