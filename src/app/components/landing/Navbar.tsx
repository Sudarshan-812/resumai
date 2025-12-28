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
        {/* 👇 CHANGED: border-indigo-100 -> border-purple-800 (Dark Purple) */}
        <div className="relative flex items-center justify-between bg-white/80 backdrop-blur-xl border border-purple-800 rounded-full px-5 py-3 shadow-2xl shadow-purple-900/10">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group mr-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight hidden sm:block">ResumAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50/50 rounded-full transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-700 hover:bg-purple-800 text-white rounded-full px-5 h-10 text-sm font-bold shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-4">
             <span className="font-bold text-lg text-gray-900 tracking-tight sm:hidden">ResumAI</span>
             <button
              className="p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 inset-x-4 mx-auto max-w-sm z-40 md:hidden"
          >
            {/* 👇 CHANGED: border-indigo-100 -> border-purple-800 */}
            <div className="bg-white/90 backdrop-blur-2xl border border-purple-800 rounded-3xl p-6 shadow-2xl shadow-purple-900/20">
              <div className="flex flex-col gap-2 text-lg font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-gray-600 hover:text-purple-700 p-3 hover:bg-purple-50 rounded-2xl transition-all"
                  >
                    {link.name}
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                ))}
                <div className="h-px bg-purple-100 my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 py-6 rounded-2xl font-bold"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6 rounded-2xl font-bold shadow-lg shadow-purple-500/20">
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