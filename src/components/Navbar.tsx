"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); // 👈 Added loading state

  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // 👇 FIX: Use getSession() instead of getUser() for instant load
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };
    initSession();

    // Listen for Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       setUser(session?.user ?? null);
       if (event === 'SIGNED_OUT') {
         setUser(null);
         router.push("/"); // Redirect home on logout
       }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State update handled by authListener above
  };

  const handleProfileClick = () => {
    if (!user) {
      router.push("/login");
    } else {
      setUserMenuOpen(!userMenuOpen);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
      scrolled || mobileMenuOpen ? "bg-black/90 backdrop-blur-md border-white/10 py-4" : "bg-transparent border-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO - Only on Landing Page */}
        {isLandingPage ? (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white z-[101]">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black fill-black" />
            </div>
            ResumAI
          </Link>
        ) : (
          <div className="w-8 h-8" />
        )}
        
        {/* RIGHT SIDE MENU */}
        <div className="flex items-center gap-6">
          
          {/* Get Started Button (Hidden if logged in OR loading) */}
          {!user && !loading && (
            <div className="hidden md:block">
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          )}

          {/* PROFILE ICON */}
          <div className="relative z-[101]">
            <button 
              onClick={handleProfileClick}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all shadow-lg",
                user 
                  ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white border-transparent hover:border-white" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
              )}
            >
              {loading ? (
                // Small spinner while checking session
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : user ? (
                user.email?.charAt(0).toUpperCase() 
              ) : (
                <User size={20} />
              )}
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
              {user && userMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 overflow-hidden ring-1 ring-black/5"
                >
                  <div className="px-3 py-3 text-xs text-zinc-500 font-mono border-b border-white/5 mb-1 truncate">
                    {user.email}
                  </div>
                  
                  <Link href="/settings">
                    <button onClick={() => setUserMenuOpen(false)} className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg flex items-center gap-2 transition-colors">
                      <Settings size={16} /> Account Details
                    </button>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white z-[101]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl z-[99]"
          >
             {!user && (
                <Link href="/login" className="w-full">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-black px-5 py-3 rounded-xl text-lg font-bold hover:bg-zinc-200"
                  >
                    Get Started
                  </motion.button>
                </Link>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}