"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { name: "Features", href: "/#features" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "Pricing", href: "/#pricing" },
];

const Navbar: FC = (): JSX.Element | null => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname();

  // Handle subtle border transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const toggleMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* SEMANTIC UPDATE: Full width, flush to the top.
        Uses a subtle border that appears when scrolling down. 
      */}
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm" 
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          
          {/* Left Side: Brand & Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2"
              aria-label="Go to homepage"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                ResumAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link href="/login" aria-label="Get Started">
                <Button
                  size="sm"
                  className="group h-8 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              {isMobileMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile navigation menu (Full Width Dropdown) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/95 px-6 pb-8 pt-4 shadow-xl backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  {link.name}
                  <ArrowRight className="h-4 w-4 opacity-50" aria-hidden="true" />
                </Link>
              ))}

              <div className="my-4 h-px w-full bg-border" />

              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={closeMobileMenu} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-lg border-border font-medium text-foreground hover:bg-muted"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/login" onClick={closeMobileMenu} className="w-full">
                  <Button
                    className="group w-full h-11 rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;