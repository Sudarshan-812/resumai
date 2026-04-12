"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, FileText, BrainCircuit, MessageSquare,
  ChevronDown, Moon, Sun, Menu, X, ArrowRight, LayoutDashboard,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/app/lib/supabase/client";

const FEATURES_MENU = [
  {
    icon: BarChart3,
    title: "ATS Score Analysis",
    description: "Precise keyword matching against any job description",
    href: "/#features",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Role-specific letters written in seconds",
    href: "/#features",
  },
  {
    icon: BrainCircuit,
    title: "Interview Simulator",
    description: "AI-generated questions with instant answer feedback",
    href: "/#features",
  },
  {
    icon: MessageSquare,
    title: "AI Resume Coach",
    description: "Chat with an AI that knows your resume inside-out",
    href: "/#features",
  },
];

const NAV_LINKS = [
  { label: "How it Works", href: "/#how-it-works", hash: "how-it-works" },
  { label: "Pricing",      href: "/#pricing",      hash: "pricing"      },
];

type DropdownKey = "features" | null;

function LogoMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function getActiveSection(): string {
  const scrollY = window.scrollY;
  if (scrollY < 80) return "";
  for (const id of ["pricing", "how-it-works", "features"]) {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop - 160) return id;
  }
  return "";
}

interface NavUser { name: string; email: string; avatarUrl?: string; initial: string; }

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [navUser, setNavUser] = useState<NavUser | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
      setNavUser({
        name,
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        initial: name[0]?.toUpperCase() ?? "U",
      });
    });
  }, []);

  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 16);
    if (pathname === "/") setActiveSection(getActiveSection());
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(null); setMobileOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (pathname === "/login" || pathname === "/reset-password") return null;

  const isDark = mounted && resolvedTheme === "dark";

  const handleHashClick = (e: React.MouseEvent, hash: string) => {
    setMobileOpen(false);
    setOpen(null);
    if (pathname === "/" && hash) {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2";

  return (
    <>
      {/* ── Desktop header ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? "bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_24px_rgba(0,0,0,0.4)]"
              : "bg-white/85 backdrop-blur-xl border-b border-zinc-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1160px] mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => handleHashClick(e, "")}
            className={`flex items-center gap-2.5 flex-shrink-0 rounded-xl ${focusRing}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
              isDark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
            }`}>
              <LogoMark />
            </div>
            <span className={`text-[15px] font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
              ResumAI
            </span>
          </Link>

          {/* Center nav — desktop */}
          <nav ref={navRef} className="hidden md:flex items-center gap-0.5 relative">

            {/* Features dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(open === "features" ? null : "features")}
                aria-haspopup="true"
                aria-expanded={open === "features"}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all ${focusRing} ${
                  open === "features"
                    ? isDark ? "text-white bg-white/10" : "text-zinc-950 bg-zinc-100"
                    : isDark ? "text-zinc-400 hover:text-white hover:bg-white/8" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                Features
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${open === "features" ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {open === "features" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    role="menu"
                    className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[360px] rounded-2xl border p-2 z-50 ${
                      isDark
                        ? "bg-zinc-900/95 backdrop-blur-2xl border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                        : "bg-white/95 backdrop-blur-2xl border-zinc-200/60 shadow-[0_24px_60px_rgba(0,0,0,0.10)]"
                    }`}
                  >
                    {FEATURES_MENU.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          role="menuitem"
                          onClick={(e) => { handleHashClick(e, "features"); setOpen(null); }}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-colors group ${focusRing} ${
                            isDark ? "hover:bg-white/8" : "hover:bg-zinc-50"
                          }`}
                        >
                          <div className={`size-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isDark
                              ? "bg-white/8 border-white/10 group-hover:bg-white/12"
                              : "bg-zinc-100 border-zinc-200/60 group-hover:bg-zinc-200"
                          }`}>
                            <Icon className={`size-4 ${isDark ? "text-zinc-300" : "text-zinc-600"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[13px] font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{item.title}</p>
                            <p className={`text-[11.5px] mt-0.5 leading-snug ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{item.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleHashClick(e, link.hash)}
                className={`relative px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all ${focusRing} ${
                  activeSection === link.hash
                    ? isDark ? "text-white bg-white/10" : "text-zinc-950 bg-zinc-100"
                    : isDark ? "text-zinc-400 hover:text-white hover:bg-white/8" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle theme"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${focusRing} ${
                  isDark
                    ? "bg-white/8 hover:bg-white/14 border border-white/10"
                    : "bg-zinc-100 hover:bg-zinc-200 border border-zinc-200"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ opacity: 0, rotate: -20 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isDark
                      ? <Sun size={14} className="text-amber-400" />
                      : <Moon size={14} className="text-zinc-500" />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            {navUser ? (
              <Link
                href="/dashboard"
                className={`hidden sm:inline-flex items-center gap-2.5 h-9 pl-2 pr-3.5 rounded-full border text-[13px] font-medium transition-all ${focusRing} ${
                  isDark
                    ? "border-white/10 bg-white/6 hover:bg-white/12 text-zinc-200"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800"
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold bg-blue-600 text-white shrink-0">
                  {navUser.avatarUrl
                    ? <img src={navUser.avatarUrl} alt={navUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : navUser.initial
                  }
                </div>
                <span>{navUser.name}</span>
                <LayoutDashboard size={12} className="opacity-50" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hidden sm:block px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all ${focusRing} ${
                    isDark
                      ? "text-zinc-400 hover:text-white hover:bg-white/8"
                      : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/try"
                  className={`hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-all ${focusRing} focus-visible:ring-offset-0 ${
                    isDark
                      ? "bg-white text-zinc-950 hover:bg-zinc-100"
                      : "bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                >
                  Try Free
                  <ArrowRight size={12} />
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className={`md:hidden flex items-center justify-center h-9 w-9 rounded-xl transition-all ${focusRing} ${
                isDark
                  ? "bg-white/8 hover:bg-white/14 border border-white/10 text-zinc-300"
                  : "bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700"
              }`}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-x-0 top-16 z-40 md:hidden border-b ${
              isDark
                ? "bg-zinc-950/98 backdrop-blur-xl border-white/[0.06]"
                : "bg-white/98 backdrop-blur-xl border-zinc-200/60"
            } shadow-[0_8px_30px_rgba(0,0,0,0.10)]`}
          >
            <nav className="max-w-[1160px] mx-auto px-6 py-5 flex flex-col gap-1">

              {/* Features section */}
              <p className={`px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                Features
              </p>
              {FEATURES_MENU.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={(e) => handleHashClick(e, "features")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                      isDark
                        ? "text-zinc-400 hover:text-white hover:bg-white/8"
                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon size={15} className="flex-shrink-0 text-blue-500" />
                    {item.title}
                  </Link>
                );
              })}

              <div className={`h-px mx-3 my-2 ${isDark ? "bg-white/8" : "bg-zinc-100"}`} />

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleHashClick(e, link.hash)}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                    isDark
                      ? "text-zinc-400 hover:text-white hover:bg-white/8"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className={`h-px mx-3 my-2 ${isDark ? "bg-white/8" : "bg-zinc-100"}`} />

              <div className="flex flex-col gap-2 px-1 pt-1 pb-2">
                {navUser ? (
                  <>
                    <Link
                      href="/upload"
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-center rounded-xl text-[14px] font-bold transition-colors ${
                        isDark
                          ? "bg-white text-zinc-950 hover:bg-zinc-100"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                      }`}
                    >
                      Analyze Resume
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-center rounded-xl text-[14px] font-medium border transition-colors ${
                        isDark
                          ? "border-white/10 text-zinc-400 hover:bg-white/8"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/try"
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-center rounded-xl text-[14px] font-bold transition-colors ${
                        isDark
                          ? "bg-white text-zinc-950 hover:bg-zinc-100"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                      }`}
                    >
                      Try Free — No Login
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-center rounded-xl text-[14px] font-medium border transition-colors ${
                        isDark
                          ? "border-white/10 text-zinc-400 hover:bg-white/8"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
