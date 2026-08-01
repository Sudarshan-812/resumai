"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlignJustify, ArrowUpRight, LogOut, CreditCard, Settings, ChevronDown } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const TABS = [
  { id: "overview", label: "Overview", href: "/dashboard" },
  { id: "history",  label: "History",  href: "/history"   },
  { id: "billing",  label: "Credits",  href: "/billing"   },
  { id: "settings", label: "Settings", href: "/settings"  },
];

export default function DashboardNavbar({ userProfile }: DashboardNavbarProps) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            backgroundColor: scrolled ? "rgba(249,249,251,0.92)" : "rgba(255,255,255,0.60)",
            y: scrolled ? -2 : 0,
          }}
          transition={{ duration: 0.4, ease: EASE_LIQUID }}
          className="pointer-events-auto relative w-full rounded-full flex items-center justify-between p-2"
          style={{
            border: "1px solid #d9d9e0",
            boxShadow: scrolled
              ? "0 20px 60px -16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "0 4px 24px -8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="ml-3 flex items-center" aria-label="Home">
            <Image
              src="/column8_black_transparent.png"
              alt="Column8"
              width={560}
              height={217}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Tab nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {TABS.map((tab) => (
              <Link key={tab.id} href={tab.href} className="relative px-4 py-2 rounded-full outline-none group">
                <AnimatePresence>
                  {activeId === tab.id && (
                    <motion.div
                      layoutId="dash-lens"
                      transition={LENS_SPRING}
                      className="absolute inset-0 rounded-full z-0"
                      style={{
                        backdropFilter: "blur(24px) saturate(2)",
                        backgroundColor: "rgba(18,165,148,0.10)",
                        border: "1px solid rgba(18,165,148,0.20)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(18,165,148,0.08)",
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.span
                  animate={{
                    scale: activeId === tab.id ? 1.1 : 1,
                    color: activeId === tab.id ? "#008573" : "#80838d",
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

          {/* Right controls */}
          <div className="flex items-center gap-2 mr-1">
            <Link
              href="/billing"
              className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-full text-[10px] font-bold transition-colors text-muted-foreground hover:text-foreground border border-border bg-background/60"
            >
              <CreditCard size={11} />
              {userProfile.credits} cr
            </Link>

            {/* Mobile nav trigger */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors border border-border text-muted-foreground hover:text-foreground"
            >
              <AlignJustify size={16} />
            </button>

            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="flex items-center gap-1 pl-0.5 pr-1.5 h-9 rounded-full transition-all outline-none group"
                >
                  <span
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-transparent group-hover:ring-teal-400/30 group-data-[state=open]:ring-teal-400/40 text-white transition-all"
                    style={{ background: !userProfile.avatarUrl ? "#12a594" : undefined }}
                  >
                    {userProfile.avatarUrl
                      ? <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : userProfile.initial}
                  </span>
                  <ChevronDown size={12} className="hidden sm:block text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-2xl p-1.5">
                <DropdownMenuLabel className="px-2.5 py-2">
                  <p className="text-sm font-semibold text-foreground truncate">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 cursor-pointer">
                  <Link href="/billing" className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <CreditCard size={14} className="text-muted-foreground" />
                      Credits
                    </span>
                    <span className="text-xs font-bold tabular-nums text-teal-600">{userProfile.credits}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 cursor-pointer">
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings size={14} className="text-muted-foreground" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className="rounded-lg px-2.5 py-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  {signingOut ? "Signing out…" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] flex flex-col p-8 bg-[#f9f9fb]/97 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white" style={{ background: !userProfile.avatarUrl ? "#12a594" : undefined }}>
                  {userProfile.avatarUrl
                    ? <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : userProfile.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card mb-8">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Credits</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground">{userProfile.credits}</span>
                <Link href="/billing" onClick={() => setOpen(false)} className="text-xs font-bold text-teal-600 hover:underline">
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
                    className="group flex items-center justify-between w-full py-4 border-b border-border"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-black tabular-nums text-muted-foreground/40">0{i+1}</span>
                      <span className={cn(
                        "text-3xl font-black tracking-tight transition-colors",
                        activeId === tab.id ? "text-teal-600" : "text-foreground/20 group-hover:text-foreground"
                      )}>
                        {tab.label}
                      </span>
                    </div>
                    <ArrowUpRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity text-foreground" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full h-11 rounded-xl border border-rose-200 font-medium text-sm flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
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
