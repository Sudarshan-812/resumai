"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const NAV_LINKS = [
  { label: "Features",    href: "/#features",      hash: "features"      },
  { label: "How it works", href: "/#how-it-works", hash: "how-it-works"  },
  { label: "Pricing",     href: "/#pricing",        hash: "pricing"       },
] as const;

interface NavUser { name: string; initial: string; avatarUrl?: string; }

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navUser, setNavUser]     = useState<NavUser | null>(null);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
      setNavUser({ name, initial: name[0]?.toUpperCase() ?? "U", avatarUrl: user.user_metadata?.avatar_url });
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (pathname === "/login" || pathname === "/reset-password") return null;

  const handleHashClick = (e: React.MouseEvent, hash: string) => {
    setMobileOpen(false);
    if (pathname === "/" && hash) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,10,10,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(200%)" : "none",
          borderBottom: `1px solid ${scrolled ? "#1f1f1f" : "transparent"}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "#6366f1" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="2" y="1" width="12" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M5 5h6M5 8h6M5 11h3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">ResumAI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main">
            {NAV_LINKS.map(({ label, href, hash }) => (
              <Link
                key={label}
                href={href}
                onClick={(e) => handleHashClick(e, hash)}
                className="text-sm transition-colors duration-200 hover:text-white"
                style={{ color: "#888888" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {navUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-9 pl-2.5 pr-4 rounded-full text-sm font-medium text-white border transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "#2a2a2a" }}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                  {navUser.avatarUrl
                    ? <img src={navUser.avatarUrl} alt={navUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : navUser.initial
                  }
                </div>
                <span style={{ color: "#aaaaaa" }}>{navUser.name}</span>
                <LayoutDashboard size={11} style={{ color: "#555555" }} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: "#888888" }}>
                  Sign in
                </Link>
                <Link
                  href="/try"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold text-black transition-colors hover:bg-neutral-100"
                  style={{ background: "#ffffff" }}
                >
                  Try free
                  <ArrowRight size={12} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden p-1.5 rounded-lg transition-colors hover:text-white"
            style={{ color: "#888888" }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-40 md:hidden overflow-hidden"
            style={{ background: "rgba(10,10,10,0.97)", borderBottom: "1px solid #1f1f1f" }}
          >
            <nav className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href, hash }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={(e) => handleHashClick(e, hash)}
                  className="px-3 py-2.5 rounded-xl text-sm transition-colors hover:text-white hover:bg-white/5"
                  style={{ color: "#888888" }}
                >
                  {label}
                </Link>
              ))}
              <div className="h-px my-3" style={{ background: "#1f1f1f" }} />
              <div className="flex flex-col gap-2">
                {navUser ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-center rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#6366f1" }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/try"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-center rounded-xl text-sm font-semibold text-white"
                      style={{ background: "#6366f1" }}
                    >
                      Try Free — No Login
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-center rounded-xl text-sm font-medium"
                      style={{ color: "#888888", border: "1px solid #1f1f1f" }}
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
