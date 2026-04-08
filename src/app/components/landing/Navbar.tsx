"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, X, AlignJustify } from "lucide-react";
import { useTheme } from "next-themes";

const TABS = [
  { id: "home",         label: "Home",         href: "/",             hash: "" },
  { id: "features",     label: "Features",     href: "/#features",    hash: "features" },
  { id: "how-it-works", label: "How it Works", href: "/#how-it-works",hash: "how-it-works" },
  { id: "pricing",      label: "Pricing",      href: "/#pricing",     hash: "pricing" },
];

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function getActiveFromScroll(): string {
  const scrollY = window.scrollY;
  if (scrollY < 80) return "home";

  const ids = ["pricing", "how-it-works", "features"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop - 160) return id;
  }
  return "home";
}

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const updateActive = useCallback(() => {
    setScrolled(window.scrollY > 15);
    if (pathname === "/") setActiveId(getActiveFromScroll());
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") { setActiveId(""); return; }
    // set initial
    setActiveId(getActiveFromScroll());
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [pathname, updateActive]);

  if (pathname === "/login") return null;

  const isDark = mounted && resolvedTheme === "dark";

  const handleNavClick = (e: React.MouseEvent, id: string, hash: string) => {
    setActiveId(id);
    setOpen(false);

    if (!hash) {
      // Home — scroll to top and clean URL
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
      return;
    }

    if (pathname === "/") {
      // Already on home — scroll without letting the browser add the hash
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // Keep URL clean so refresh doesn't re-scroll
        window.history.replaceState(null, "", "/");
      }
    }
    // If on another page, allow the full navigation to /#hash (browser will scroll on load)
  };

  return (
    <>
      {/* ── Desktop / tablet navbar ── */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[780px] px-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto flex items-center justify-between px-2 py-2 rounded-full transition-all duration-300"
          style={{
            backdropFilter: "blur(24px) saturate(1.8)",
            backgroundColor: isDark ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.75)",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
            boxShadow: scrolled
              ? isDark
                ? "0 16px 48px -8px rgba(0,0,0,0.6)"
                : "0 16px 48px -8px rgba(0,0,0,0.10)"
              : "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Logo */}
          <Link href="/" onClick={(e) => handleNavClick(e, "home", "")} className="flex items-center gap-2.5 ml-2 group" aria-label="Home">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <LogoMark />
            </div>
            <span className={`text-sm font-semibold tracking-tight hidden sm:block ${isDark ? "text-white" : "text-zinc-900"}`}>
              ResumAI
            </span>
          </Link>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-0.5 relative">
            {TABS.map((tab) => {
              const isActive = activeId === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={(e) => handleNavClick(e, tab.id, tab.hash)}
                  className="relative px-4 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-colors duration-150 outline-none"
                  style={{
                    color: isActive
                      ? isDark ? "#ffffff" : "#18181b"
                      : isDark ? "#71717a" : "#a1a1aa",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
                        border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 mr-1">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle theme"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isDark
                    ? "bg-white/10 hover:bg-white/15 border border-white/10"
                    : "bg-black/5 hover:bg-black/10 border border-black/5"
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
                    {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-zinc-500" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            <Link href="/try" className="hidden sm:block">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center h-9 px-4 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                  isDark ? "bg-white text-black hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-700"
                }`}
              >
                Try Free
              </motion.span>
            </Link>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                isDark ? "bg-white/10 border border-white/10" : "bg-black/5 border border-black/5"
              }`}
            >
              <AlignJustify size={15} className={isDark ? "text-white" : "text-zinc-700"} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[110] flex flex-col p-8 backdrop-blur-2xl ${
              isDark ? "bg-zinc-950/96" : "bg-white/96"
            }`}
          >
            <div className="flex items-center justify-between mb-12">
              <Link href="/" onClick={(e) => handleNavClick(e, "home", "")} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <LogoMark />
                </div>
                <span className="font-semibold text-sm">ResumAI</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white/10 text-white" : "border-zinc-200 text-zinc-800"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {TABS.map((tab, i) => (
                <motion.div
                  key={tab.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={tab.href}
                    onClick={(e) => handleNavClick(e, tab.id, tab.hash)}
                    className={`flex items-center justify-between py-4 border-b text-3xl font-black tracking-tight transition-opacity ${
                      isDark
                        ? "border-white/6 text-white/30 hover:text-white"
                        : "border-zinc-100 text-zinc-900/25 hover:text-zinc-900"
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-bold tabular-nums ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                      0{i + 1}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link href="/try" onClick={() => setOpen(false)}>
                <div className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center ${
                  isDark ? "bg-white text-black" : "bg-zinc-900 text-white"
                }`}>
                  Try Free — No Login
                </div>
              </Link>
              <Link href="/login" onClick={() => setOpen(false)}>
                <div className={`w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center border ${
                  isDark ? "border-white/10 text-zinc-400" : "border-zinc-200 text-zinc-600"
                }`}>
                  Sign In
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
