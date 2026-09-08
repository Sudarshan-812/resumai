"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  List as Menu, X, ArrowRight, CaretDown,
  SquaresFour, CreditCard, Gear, SignOut,
} from "@phosphor-icons/react";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import VivaLogo from "@/components/branding/VivaLogo";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { label: "Features",     href: "/#features",     hash: "features"     },
  { label: "How it works", href: "/#how-it-works", hash: "how-it-works" },
  { label: "Pricing",      href: "/#pricing",      hash: "pricing"      },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export interface NavUser { name: string; initial: string; avatarUrl?: string; }

export default function Navbar({ initialUser = null }: { initialUser?: NavUser | null }) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const navUser  = initialUser;
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Scroll-spy for the one-page sections — home only.
  useEffect(() => {
    if (pathname !== "/") return;
    const els = NAV_LINKS
      .map((l) => document.getElementById(l.hash))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActiveHash(top.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  if (pathname === "/login" || pathname === "/reset-password") return null;

  const handleHashClick = (e: React.MouseEvent, hash: string) => {
    setMobileOpen(false);
    if (pathname === "/" && hash) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", `/#${hash}`);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,border-color] duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(252,252,253,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(14px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(180%)" : "none",
          borderBottom: `1px solid ${scrolled ? "rgba(217,217,224,0.7)" : "transparent"}`,
          boxShadow: scrolled ? "0 6px 24px -18px rgba(18,20,24,0.28)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            aria-label="Viva home"
            className="flex items-center shrink-0 rounded-lg px-1 py-1 -ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/45"
          >
            <VivaLogo height={30} priority />
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
            {NAV_LINKS.map(({ label, href, hash }) => {
              const active = pathname === "/" && activeHash === hash;
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={(e) => handleHashClick(e, hash)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "group relative px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/40",
                    active ? "text-[#1c2024]" : "text-[#60646c] hover:text-[#1c2024]"
                  )}
                >
                  {label}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-3 right-3 -bottom-px h-[2px] rounded-full bg-[#12a594] origin-left transition-transform duration-200 ease-out",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {navUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group inline-flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border border-[#e2e2e8] bg-white/80 hover:bg-white hover:border-[#d9d9e0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/40">
                    <span
                      className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: navUser.avatarUrl ? undefined : "#12a594" }}
                    >
                      {navUser.avatarUrl
                        ? <img src={navUser.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        : navUser.initial}
                    </span>
                    <span className="text-[13px] font-medium text-[#1c2024] max-w-[9rem] truncate">{navUser.name}</span>
                    <CaretDown size={12} weight="bold" className="text-[#80838d] transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 rounded-2xl p-1.5">
                  <DropdownMenuLabel className="px-2.5 py-1.5 text-[13px] font-semibold text-foreground truncate">
                    {navUser.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2 w-full">
                      <SquaresFour size={15} />Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 cursor-pointer">
                    <Link href="/billing" className="flex items-center gap-2 w-full">
                      <CreditCard size={15} />Credits &amp; Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-2 w-full">
                      <Gear size={15} />Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                    className="rounded-lg px-2.5 py-2 cursor-pointer"
                  >
                    <SignOut size={15} />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-[13.5px] font-medium text-[#60646c] hover:text-[#1c2024] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/40"
                >
                  Sign in
                </Link>
                <Link
                  href="/try"
                  className="group inline-flex items-center gap-1.5 h-9 pl-4 pr-3.5 rounded-lg text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/50"
                  style={{ background: "#12a594", boxShadow: "0 2px 14px -2px rgba(18,165,148,0.5)" }}
                >
                  Try free
                  <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden w-9 h-9 -mr-1.5 rounded-lg flex items-center justify-center text-[#60646c] hover:bg-black/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12a594]/40"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-16 z-40 md:hidden bg-black/10 backdrop-blur-[2px]"
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="fixed inset-x-0 top-16 z-40 md:hidden"
              style={{ background: "#fcfcfd", borderBottom: "1px solid #d9d9e0" }}
            >
              <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-0.5">
                {NAV_LINKS.map(({ label, href, hash }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={(e) => handleHashClick(e, hash)}
                    className="px-3 py-3 rounded-xl text-[15px] font-medium text-[#1c2024] hover:bg-black/[0.04] transition-colors"
                  >
                    {label}
                  </Link>
                ))}

                <div className="h-px my-3 bg-[#e2e2e8]" />

                {navUser ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                      <span
                        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: navUser.avatarUrl ? undefined : "#12a594" }}
                      >
                        {navUser.avatarUrl
                          ? <img src={navUser.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          : navUser.initial}
                      </span>
                      <span className="text-[14px] font-semibold text-[#1c2024] truncate">{navUser.name}</span>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[#1c2024] hover:bg-black/[0.04]">
                      <SquaresFour size={17} className="text-[#80838d]" />Dashboard
                    </Link>
                    <Link href="/billing" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[#1c2024] hover:bg-black/[0.04]">
                      <CreditCard size={17} className="text-[#80838d]" />Credits &amp; Billing
                    </Link>
                    <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-[#1c2024] hover:bg-black/[0.04]">
                      <Gear size={17} className="text-[#80838d]" />Settings
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); void handleSignOut(); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <SignOut size={17} />Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link href="/try" onClick={() => setMobileOpen(false)} className="h-11 flex items-center justify-center rounded-xl text-[14px] font-semibold text-white" style={{ background: "#12a594" }}>
                      Analyze my resume - free
                    </Link>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="h-11 flex items-center justify-center rounded-xl text-[14px] font-medium text-[#60646c] border border-[#d9d9e0]">
                      Sign in
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
