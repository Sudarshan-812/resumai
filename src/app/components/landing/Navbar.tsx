"use client";

import type { FC, JSX } from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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

const navAnimation: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, type: "spring", bounce: 0.3 },
  },
};

const mobileMenuAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
};

const Navbar: FC = (): JSX.Element | null => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

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
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navAnimation}
        className="fixed inset-x-0 top-4 z-50 mx-auto max-w-4xl px-4 md:px-0"
        aria-label="Primary navigation"
      >
        <div className="relative flex items-center justify-between rounded-full border border-purple-800 bg-white/80 px-5 py-3 shadow-2xl shadow-purple-900/10 backdrop-blur-xl">
          
          {/* Brand / Logo */}
          <Link
            href="/"
            className="group mr-4 flex items-center gap-2"
            aria-label="Go to homepage"
          >
            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 transition-transform group-hover:rotate-12">
              <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-gray-900 sm:block">
              ResumAI
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-purple-50/50 hover:text-purple-700"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="ml-4 hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-purple-700"
            >
              Sign In
            </Link>

            {/* Custom Animated Button (Desktop) */}
            <Link 
              href="/login" 
              className="relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-purple-500 rounded-full shadow-md group"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-purple-500 group-hover:translate-x-0 ease">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
              <span className="absolute flex items-center justify-center w-full h-full text-purple-500 transition-all duration-300 transform group-hover:translate-x-full ease">
                Get Started
              </span>
              <span className="relative invisible">Get Started</span>
            </Link>
          </div>

          {/* Mobile header (brand + toggle) */}
          <div className="flex items-center gap-4 md:hidden">
            <span className="text-lg font-bold tracking-tight text-gray-900 sm:hidden">
              ResumAI
            </span>
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700"
            >
              {isMobileMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile navigation menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuAnimation}
            className="fixed inset-x-4 top-20 z-40 mx-auto max-w-sm md:hidden"
          >
            <div className="rounded-3xl border border-purple-800 bg-white/90 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-2 text-lg font-medium">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-2xl p-3 text-gray-600 transition-all hover:bg-purple-50 hover:text-purple-700"
                  >
                    {link.name}
                    <ArrowRight
                      className="h-4 w-4 opacity-50"
                      aria-hidden="true"
                    />
                  </Link>
                ))}

                <div className="my-4 h-px bg-purple-100" />

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-purple-200 py-6 font-bold text-purple-700 hover:bg-purple-50"
                    >
                      Sign In
                    </Button>
                  </Link>

                  {/* Custom Animated Button (Mobile) */}
                  <Link 
                    href="/login" 
                    onClick={closeMobileMenu}
                    className="relative w-full inline-flex items-center justify-center px-6 py-6 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-purple-500 rounded-2xl shadow-md group"
                  >
                     <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-purple-500 group-hover:translate-x-0 ease">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </span>
                    <span className="absolute flex items-center justify-center w-full h-full text-purple-500 transition-all duration-300 transform group-hover:translate-x-full ease">
                      Get Started
                    </span>
                    <span className="relative invisible">Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;