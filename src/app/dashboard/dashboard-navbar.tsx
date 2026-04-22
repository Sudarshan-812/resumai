"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, X, AlignJustify, ArrowUpRight, LogOut, CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";

const EASE_LIQUID = [0.16, 1, 0.3, 1] as const;
const LENS_SPRING = { type: "spring" as const, stiffness: 350, damping: 28, mass: 0.5 };

interface DashboardNavbarProps {
  userProfile: {
    name: string;
    email: string;
    credits: number;
    initial: string;
    avatarUrl?: string;
  };
}

function LogoMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const TABS = [
  { id: "overview", label: "Overview", href: "/dashboard" },
  { id: "history",  label: "History",  href: "/history"   },
  { id: "billing",  label: "Credits",  href: "/billing"   },
  { id: "settings", label: "Settings", href: "/settings"  },
];

export default function DashboardNavbar({ userProfile }: DashboardNavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const activeId = TABS.find(t => {
    if (t.href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(t.href);
  })?.id ?? "overview";

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, ease: EASE_LIQUID }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[860px] px-4 pointer-events-none"
      >
        <motion.div
          animate={{
            backdropFilter: scrolled ? "blur(32px) saturate(1.8)" : "blur(18px)",
            backgroundColor: isDark ? "rgba(12,12,12,0.90)" : "rgba(255,255,255,0.40)",
            y: scrolled ? -2 : 0,
          }}
          transition={{ duration: 0.4, ease: EASE_LIQUID }}
          className="pointer-events-auto relative w-full rounded-full flex items-center justify-between p-2"
          style={{
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: scrolled
              ? isDark
                ? "0 20px 40px -12px rgba(0,0,0,0.7)"
                : "0 20px 60px -16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)"
              : isDark
                ? "0 4px 16px -4px rgba(0,0,0,0.5)"
                : "0 4px 24px -8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <Link href="/" className="flex items-center gap-2 ml-3 group" aria-label="Home">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <LogoMark />
            </div>
            <span className={cn("text-sm font-semibold tracking-tight hidden sm:block", isDark ? "text-white" : "text-zinc-900")}>
              ResumAI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative px-4 py-2 rounded-full outline-none group"
              >
                <AnimatePresence>
                  {activeId === tab.id && (
                    <motion.div
                      layoutId="dash-lens"
                      transition={LENS_SPRING}
                      className="absolute inset-0 rounded-full z-0"
                      style={{
                        backdropFilter: "blur(24px) saturate(2)",
                        backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
                        border: isDark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.10)",
                        boxShadow: isDark
                          ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.3)"
                          : "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.span
                  animate={{
                    scale: activeId === tab.id ? 1.12 : 1,
                    color: activeId === tab.id
                      ? isDark ? "#ffffff" : "#18181b"
                      : isDark ? "#71717a" : "#a1a1aa",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="relative z-10 text-[11px] font-semibold tracking-wide inline-block"
                  style={{ transformOrigin: "center" }}
                >
                  {tab.label}
                </motion.span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 mr-1">
            <Link href="/billing" className={cn(
              "hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-full text-[10px] font-bold transition-colors",
              isDark ? "bg-white/8 text-zinc-300 hover:bg-white/12 border border-white/8" : "bg-black/4 text-zinc-600 hover:bg-black/8 border border-black/5"
            )}>
              <CreditCard size={11} />
              {userProfile.credits} cr
            </Link>

            {mounted && (
              <button
                onClick={() => {
                  const next = isDark ? "light" : "dark";
                  const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
                  if (doc.startViewTransition) { doc.startViewTransition(() => setTheme(next)); }
                  else setTheme(next);
                }}
                aria-label="Toggle theme"
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90",
                  isDark ? "bg-white/8 hover:bg-white/12 border border-white/8" : "bg-black/4 hover:bg-black/8 border border-black/5"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-zinc-500" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cn(
                "w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold transition-all ring-2 ring-transparent hover:ring-primary/30",
                !userProfile.avatarUrl && (isDark ? "bg-white text-black" : "bg-zinc-900 text-white")
              )}
            >
              {userProfile.avatarUrl
                ? <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : userProfile.initial}
            </button>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "fixed inset-0 z-[110] flex flex-col p-8 backdrop-blur-2xl",
              isDark ? "bg-zinc-950/96" : "bg-white/95"
            )}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold",
                  !userProfile.avatarUrl && (isDark ? "bg-white text-black" : "bg-zinc-900 text-white")
                )}>
                  {userProfile.avatarUrl
                    ? <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : userProfile.initial}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>{userProfile.name}</p>
                  <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>{userProfile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                  isDark ? "border-white/10 text-white hover:bg-white/5" : "border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                )}
              >
                <X size={18} />
              </button>
            </div>

            <div className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border mb-8",
              isDark ? "border-white/8 bg-white/4" : "border-zinc-100 bg-zinc-50"
            )}>
              <div className="flex items-center gap-2">
                <CreditCard size={14} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
                <span className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-zinc-700")}>Credits</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}>{userProfile.credits}</span>
                <Link href="/billing" onClick={() => setOpen(false)} className="text-xs font-bold text-primary hover:underline">
                  Top up
                </Link>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {TABS.map((tab, i) => (
                <motion.div
                  key={tab.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, ease: EASE_LIQUID, duration: 0.35 }}
                >
                  <Link
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center justify-between w-full py-4 border-b",
                      isDark ? "border-white/5" : "border-zinc-100"
                    )}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className={cn("text-[10px] font-black tabular-nums", isDark ? "text-zinc-700" : "text-zinc-300")}>0{i+1}</span>
                      <span className={cn(
                        "text-3xl font-black tracking-tight transition-opacity",
                        activeId === tab.id
                          ? isDark ? "text-white" : "text-zinc-900"
                          : isDark ? "text-white/20 group-hover:text-white" : "text-zinc-900/20 group-hover:text-zinc-900"
                      )}>
                        {tab.label}
                      </span>
                    </div>
                    <ArrowUpRight size={18} className={cn("opacity-20 group-hover:opacity-100 transition-opacity", isDark ? "text-white" : "text-zinc-900")} />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className={cn(
                  "w-full h-11 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-colors",
                  isDark
                    ? "border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                    : "border-rose-200 text-rose-600 hover:bg-rose-50"
                )}
              >
                <LogOut size={14} />
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
