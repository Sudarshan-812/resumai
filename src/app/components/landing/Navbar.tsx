"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Pricing", href: "/#pricing" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="fixed top-4 inset-x-0 mx-auto max-w-4xl z-50 px-4 md:px-0"
      >
        {/* 👇 CHANGED: border-black/5 -> border-black (Solid Visible Border) */}
        <div className="relative flex items-center justify-between bg-white/80 backdrop-blur-xl border border-black rounded-full px-5 py-3 shadow-xl shadow-black/5">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group mr-4">
            <div className="bg-black p-1.5 rounded-full group-hover:bg-zinc-800 transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-lg text-black tracking-tight hidden sm:block">ResumAI</span>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-black/5 rounded-full transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* --- DESKTOP ACTIONS --- */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-5 h-10 text-sm font-bold shadow-lg shadow-black/10">
                Get Started
              </Button>
            </Link>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex md:hidden items-center gap-4">
             <span className="font-bold text-lg text-black tracking-tight sm:hidden">ResumAI</span>
             <button
              className="p-2 text-black hover:bg-black/5 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 inset-x-4 mx-auto max-w-sm z-40 md:hidden"
          >
            {/* 👇 CHANGED: border-black/5 -> border-black */}
            <div className="bg-white/90 backdrop-blur-2xl border border-black rounded-3xl p-6 shadow-2xl shadow-black/10">
              <div className="flex flex-col gap-2 text-lg font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-zinc-600 hover:text-black p-3 hover:bg-black/5 rounded-2xl transition-all"
                  >
                    {link.name}
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                ))}
                <div className="h-px bg-black/5 my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-black text-black hover:bg-black/5 py-6 rounded-2xl font-bold"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-black hover:bg-zinc-800 text-white py-6 rounded-2xl font-bold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}