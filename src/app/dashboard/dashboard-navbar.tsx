"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Menu, X, LayoutDashboard, FileText, 
  Settings, LogOut, CreditCard, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface DashboardNavbarProps {
  userProfile: {
    name: string;
    email: string;
    credits: number;
    initial: string;
  };
  onSignOut: () => void;
  isSigningOut: boolean;
}

export default function DashboardNavbar({ userProfile, onSignOut, isSigningOut }: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalType, setModalType] = useState<"resumes" | "settings" | null>(null);
  const pathname = usePathname();

  const handleNavClick = (type: "resumes" | "settings") => {
    setModalType(type);
    setModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-0 top-4 z-50 mx-auto max-w-6xl px-4 md:px-0"
      >
        <div className="relative flex items-center justify-between rounded-full border border-purple-200 bg-white/80 px-4 py-2.5 shadow-xl shadow-purple-900/5 backdrop-blur-xl">
          
          {/* Left: Brand + Desktop Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="group flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 transition-transform group-hover:rotate-12">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">ResumAI</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  pathname === "/dashboard" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>

              <button
                onClick={() => handleNavClick("resumes")}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <FileText className="h-4 w-4" />
                My Resumes
              </button>

              <button
                onClick={() => handleNavClick("settings")}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-900">{userProfile.credits} Credits</span>
              {/* UPDATED LINK HERE */}
              <Link href="/billing" className="ml-1 text-xs font-bold text-indigo-600 hover:underline">Top up</Link>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-3 pl-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                  {userProfile.initial}
                </div>
                <span className="text-sm font-medium text-gray-700">{userProfile.name}</span>
              </div>
              <button onClick={onSignOut} disabled={isSigningOut} className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-700">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed inset-x-4 top-20 z-40 mx-auto max-w-sm md:hidden"
          >
            <div className="rounded-3xl border border-purple-200 bg-white/95 p-5 shadow-2xl shadow-purple-900/20 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">{userProfile.initial}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-indigo-600 font-medium">{userProfile.credits} Credits Available</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center justify-between rounded-xl p-3 text-sm font-medium transition-all", pathname === "/dashboard" ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50")}>
                  <div className="flex items-center gap-3"><LayoutDashboard className="h-4 w-4" />Overview</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </Link>
                
                <button onClick={() => handleNavClick("resumes")} className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 w-full">
                  <div className="flex items-center gap-3"><FileText className="h-4 w-4" />My Resumes</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button onClick={() => handleNavClick("settings")} className="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 w-full">
                  <div className="flex items-center gap-3"><Settings className="h-4 w-4" />Settings</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>
              </div>
              <div className="my-4 h-px bg-gray-100" />
              <Button variant="ghost" onClick={onSignOut} className="w-full justify-start gap-3 rounded-xl py-6 text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- COMING SOON MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl text-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Enlarged Animation */}
              <div className="mx-auto h-72 w-72">
                <DotLottieReact
                  src="https://lottie.host/494878ca-55d5-4afd-87d4-ab556d9851f9/8lYbxp0lwv.lottie"
                  loop
                  autoplay
                  className="h-full w-full"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {modalType === "resumes" ? "History Coming Soon" : "Settings Under Construction"}
              </h3>
              <p className="text-slate-500 mb-6 px-4">
                {modalType === "resumes" 
                  ? "We are building a timeline view so you can access all your past scans and edits in one place." 
                  : "We are currently building the profile management and billing settings page."}
              </p>

              <Button onClick={() => setModalOpen(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}