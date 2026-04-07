"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, X, AlignJustify, ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";

const EASE_LIQUID = [0.16, 1, 0.3, 1] as const;
const LENS_SPRING = { type: "spring" as const, stiffness: 350, damping: 28, mass: 0.5 };

const TABS = [
  { id: "home",         label: "Home",         href: "/" },
  { id: "features",     label: "Features",     href: "/#features" },
  { id: "how-it-works", label: "How it Works", href: "/#how-it-works" },
  { id: "pricing",      label: "Pricing",      href: "/#pricing" },
];

// Clean geometric logo mark — no AI sparkle
function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") { setActiveId(null); return; }
    setActiveId("home"); // default to Home when at top
    const sectionIds = ["features", "how-it-works", "pricing"];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveId(visible.length > 0 ? visible[0].target.id : "home");
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  // Hide on auth pages
  if (pathname === "/login") return null;

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, ease: EASE_LIQUID }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[820px] px-4 pointer-events-none"
      >
        <motion.div
          animate={{
            backdropFilter: scrolled ? "blur(32px) saturate(1.8)" : "blur(18px)",
            backgroundColor: isDark ? "rgba(12,12,12,0.90)" : "rgba(255,255,255,0.40)",
            y: scrolled ? -2 : 0,
          }}
          transition={{ duration: 0.4, ease: EASE_LIQUID }}
          className="pointer-events-auto relative w-full rounded-full flex items-center justify-between p-2 transition-shadow duration-500"
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 ml-3 group" aria-label="Home">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <LogoMark />
            </div>
            <span className={`text-sm font-semibold tracking-tight hidden sm:block ${isDark ? "text-white" : "text-zinc-900"}`}>
              ResumAI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative px-5 py-2 rounded-full outline-none group"
              >
                <AnimatePresence>
                  {activeId === tab.id && (
                    <motion.div
                      layoutId="water-lens"
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

          {/* Right actions */}
          <div className="flex items-center gap-2 mr-1">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => {
                  const next = isDark ? "light" : "dark";
                  const doc = document as any;
                  if (doc.startViewTransition) { doc.startViewTransition(() => setTheme(next)); }
                  else setTheme(next);
                }}
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
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark
                      ? <Sun size={14} className="text-amber-400" />
                      : <Moon size={14} className="text-zinc-500" />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            {/* Try Free CTA */}
            <Link href="/try" className="hidden sm:block">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-100"
                    : "bg-zinc-900 text-white hover:bg-zinc-700"
                }`}
              >
                Try Free
              </motion.span>
            </Link>

            {/* Mobile hamburger */}
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
        </motion.div>
      </motion.header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-0 z-[110] flex flex-col p-8 backdrop-blur-2xl ${
              isDark ? "bg-zinc-950/96" : "bg-white/95"
            }`}
          >
            <div className="flex items-center justify-between mb-14">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <LogoMark />
                </div>
                <span className="font-semibold text-sm">ResumAI</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
                  isDark ? "border-white/10 text-white hover:bg-white/5" : "border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {TABS.map((tab, i) => (
                <motion.div
                  key={tab.id}
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07, ease: EASE_LIQUID, duration: 0.4 }}
                >
                  <Link
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center justify-between w-full py-5 border-b ${
                      isDark ? "border-white/6" : "border-zinc-100"
                    }`}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className={`text-[10px] font-black tabular-nums ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                        0{i + 1}
                      </span>
                      <span className={`text-4xl font-black tracking-tight transition-opacity ${
                        isDark ? "text-white/20 group-hover:text-white" : "text-zinc-900/20 group-hover:text-zinc-900"
                      }`}>
                        {tab.label}
                      </span>
                    </div>
                    <ArrowUpRight size={18} className={`opacity-20 group-hover:opacity-100 transition-opacity ${isDark ? "text-white" : "text-zinc-900"}`} />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link href="/try" onClick={() => setOpen(false)}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center ${
                    isDark ? "bg-white text-black" : "bg-zinc-900 text-white"
                  }`}
                >
                  Try Free — No Login
                </motion.div>
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
