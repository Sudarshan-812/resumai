"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SquaresFour, ClockCounterClockwise, FileText, PencilLine,
  Microphone, GitBranch, CreditCard, GearSix, SignOut,
  List, Plus, SidebarSimple, CaretUpDown, Coins,
} from "@phosphor-icons/react";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import VivaLogo from "@/components/branding/VivaLogo";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  name: string;
  email: string;
  credits: number;
  initial: string;
  avatarUrl?: string;
}

type NavItem = { id: string; label: string; href: string; icon: React.ElementType };

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Overview",     href: "/dashboard",         icon: SquaresFour },
      { id: "resumes",   label: "Resumes",      href: "/dashboard/resumes", icon: FileText },
      { id: "history",   label: "History",      href: "/history",           icon: ClockCounterClockwise },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { id: "interview",    label: "Mock Interview",  href: "/dashboard/interview",    icon: Microphone },
      { id: "cover-letter", label: "Cover Letter",    href: "/dashboard/cover-letter", icon: PencilLine },
      { id: "versions",     label: "Versions",        href: "/dashboard/versions",     icon: GitBranch },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Overview",
  resumes: "Resumes",
  history: "History",
  interview: "Mock Interview",
  "cover-letter": "Cover Letter",
  versions: "Versions",
  billing: "Billing",
  settings: "Settings",
};

function Avatar({ profile, size = 28 }: { profile: UserProfile | null; size?: number }) {
  return (
    <span
      className="rounded-full overflow-hidden flex items-center justify-center font-semibold shrink-0 select-none text-white bg-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {profile?.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        : (profile?.initial ?? "U")}
    </span>
  );
}

function AccountMenu({
  profile, collapsed, onSignOut, onNavigate,
}: {
  profile: UserProfile | null;
  collapsed: boolean;
  onSignOut: () => void;
  onNavigate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center rounded-md hover:bg-black/[0.045] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            collapsed ? "w-9 h-9 justify-center" : "w-full h-11 gap-2.5 px-1.5"
          )}
        >
          <Avatar profile={profile} size={collapsed ? 26 : 28} />
          {!collapsed && (
            <>
              <span className="flex-1 min-w-0 text-left">
                <span className="block text-[13px] font-medium text-foreground truncate leading-tight">
                  {profile?.name ?? "Account"}
                </span>
                <span className="block text-[11px] text-muted-foreground truncate leading-tight">
                  {profile?.email ?? ""}
                </span>
              </span>
              <CaretUpDown size={14} className="text-muted-foreground shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        sideOffset={8}
        className="w-56 rounded-xl p-1"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <p className="text-[13px] font-medium text-foreground truncate">{profile?.name ?? "Account"}</p>
          <p className="text-[11px] text-muted-foreground truncate">{profile?.email ?? ""}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-lg px-2 py-1.5 cursor-pointer">
          <Link href="/settings" onClick={onNavigate} className="flex items-center gap-2 w-full">
            <GearSix size={15} />Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg px-2 py-1.5 cursor-pointer">
          <Link href="/billing" onClick={onNavigate} className="flex items-center gap-2 w-full">
            <CreditCard size={15} />Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={onSignOut}
          className="rounded-lg px-2 py-1.5 cursor-pointer"
        >
          <SignOut size={15} />Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  profile, activeId, collapsed, onNavigate, onSignOut, onToggleCollapse,
}: {
  profile: UserProfile | null;
  activeId: string;
  collapsed: boolean;
  onNavigate: () => void;
  onSignOut: () => void;
  onToggleCollapse: () => void;
}) {
  const lowCredits = (profile?.credits ?? 0) < 2;

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("h-14 shrink-0 flex items-center", collapsed ? "justify-center px-2" : "px-4 justify-between")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="Viva home" className="flex items-center">
          {collapsed ? <VivaLogo variant="mark" height={24} /> : <VivaLogo height={26} />}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="hidden md:flex w-7 h-7 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.045] transition-colors"
          >
            <SidebarSimple size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            {collapsed ? (
              <div className="h-px bg-border mx-1.5 mb-2" />
            ) : (
              <p className="px-2 mb-1 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center h-8 rounded-md text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      collapsed ? "justify-center px-2" : "gap-2.5 px-2",
                      active
                        ? "bg-black/[0.05] text-foreground font-medium"
                        : "text-[#5b5d66] hover:text-foreground hover:bg-black/[0.035]"
                    )}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
                    )}
                    <Icon size={17} weight={active ? "fill" : "regular"} className={cn("shrink-0", active ? "text-foreground" : "text-[#8a8c94]")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("shrink-0 border-t border-border", collapsed ? "p-2 flex flex-col items-center gap-1" : "p-2 space-y-0.5")}>
        <Link
          href="/billing"
          onClick={onNavigate}
          title={collapsed ? "Credits & Billing" : undefined}
          className={cn(
            "flex items-center rounded-md hover:bg-black/[0.045] transition-colors text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            collapsed ? "w-9 h-9 justify-center" : "h-9 px-2 gap-2 justify-between"
          )}
        >
          {collapsed ? (
            <Coins size={17} className={lowCredits ? "text-amber-500" : "text-muted-foreground"} />
          ) : (
            <>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Coins size={15} />
                <span className="text-foreground">Credits</span>
              </span>
              <span className={cn("tabular-nums font-medium", lowCredits ? "text-amber-600" : "text-foreground")}>
                {profile?.credits ?? "–"}
              </span>
            </>
          )}
        </Link>

        <AccountMenu profile={profile} collapsed={collapsed} onSignOut={onSignOut} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    try {
      if (localStorage.getItem("sidebar-collapsed") === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = () => {
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
        initial: (name[0] ?? "U").toUpperCase(),
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeId =
    pathname === "/dashboard"                       ? "dashboard"
    : pathname.startsWith("/dashboard/resumes")     ? "resumes"
    : pathname.startsWith("/history")               ? "history"
    : pathname.startsWith("/dashboard/cover-letter")? "cover-letter"
    : pathname.startsWith("/dashboard/interview")   ? "interview"
    : pathname.startsWith("/dashboard/versions")    ? "versions"
    : pathname.startsWith("/billing")               ? "billing"
    : pathname.startsWith("/settings")              ? "settings"
    : pathname.startsWith("/dashboard/")            ? "report"
    : "dashboard";

  const pageTitle = PAGE_TITLES[activeId] ?? "Report";

  const sidebarProps = {
    profile, activeId,
    onNavigate: () => setMobileOpen(false),
    onSignOut: handleSignOut,
    onToggleCollapse: toggleCollapse,
  };

  return (
    <div className="flex h-dvh bg-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-border bg-[#fbfbfc] transition-[width] duration-200 ease-out",
          collapsed ? "w-[60px]" : "w-[236px]"
        )}
      >
        <SidebarContent {...sidebarProps} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/25 md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col border-r border-border bg-[#fbfbfc] md:hidden"
            >
              <SidebarContent {...sidebarProps} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-white">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-8 h-8 -ml-1.5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.045] transition-colors"
          >
            <List size={18} />
          </button>

          {collapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              className="hidden md:flex w-8 h-8 -ml-2 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.045] transition-colors"
            >
              <SidebarSimple size={16} />
            </button>
          )}

          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Viva</Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground truncate">{pageTitle}</span>
          </div>

          <Link
            href="/upload"
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-md text-[13px] font-medium text-white bg-primary hover:bg-[#0f9184] transition-colors"
          >
            <Plus size={14} weight="bold" />
            <span className="hidden sm:inline">New analysis</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
