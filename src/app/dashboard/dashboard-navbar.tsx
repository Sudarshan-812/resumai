"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Menu, X, LayoutDashboard, FileText, 
  Settings, CreditCard, ChevronRight 
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
}

export default function DashboardNavbar({ userProfile }: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"resumes" | "settings" | null>(null);
  const pathname = usePathname();

  const handleNavClick = (type: "resumes" | "settings") => {
    setModalType(type);
    setModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          
          {/* ─── LEFT SIDE: BRAND + NAV ─── */}
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="group flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">ResumAI</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === "/dashboard" 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>

              <button
                onClick={() => handleNavClick("resumes")}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                History
              </button>

              <button
                onClick={() => handleNavClick("settings")}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Config
              </button>
            </nav>
          </div>

          {/* ─── RIGHT SIDE: PROFILE ─── */}
          <div className="flex items-center gap-4">
            
            {/* Technical Credit Badge */}
            <div className="hidden items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-1.5 md:flex border-dashed">
              <div className="flex items-center gap-2 border-r border-border pr-3">
                 <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                 <span className="font-mono text-[11px] font-bold text-foreground">
                    {userProfile.credits}_CR
                 </span>
              </div>
              <Link href="/billing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                Top up
              </Link>
            </div>

            <div className="hidden h-6 w-px bg-border md:block" />

            {/* Account Identifier - LogOut Removed from here */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-[11px] font-bold leading-none text-foreground">{userProfile.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground font-mono lowercase opacity-60">{userProfile.email.split('@')[0]}</p>
              </div>
              
              <button 
                onClick={() => handleNavClick("settings")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-xs font-bold text-primary shadow-sm uppercase hover:border-primary/30 transition-colors"
              >
                {userProfile.initial}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/95 px-6 pb-8 pt-4 shadow-xl backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    {userProfile.initial}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{userProfile.name}</p>
                  <p className="font-mono text-[10px] text-primary uppercase tracking-tight">{userProfile.credits} Credits Available</p>
                </div>
                <Link href="/billing">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg border-primary/20 text-primary font-bold text-[10px] uppercase">Refill</Button>
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-all", pathname === "/dashboard" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                  <div className="flex items-center gap-3"><LayoutDashboard className="h-4 w-4" />Overview</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </Link>
                
                <button onClick={() => handleNavClick("resumes")} className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 w-full text-left">
                  <div className="flex items-center gap-3"><FileText className="h-4 w-4" />History</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>

                <button onClick={() => handleNavClick("settings")} className="flex items-center justify-between rounded-lg p-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 w-full text-left border-b border-border/50 pb-3 mb-2">
                  <div className="flex items-center gap-3"><Settings className="h-4 w-4" />Config</div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODALS: COMING SOON (Sign Out will live here eventually) ─── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-2xl text-center"
            >
              <button onClick={() => setModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>

              <div className="mx-auto h-48 w-48 mb-4">
                <DotLottieReact src="https://lottie.host/494878ca-55d5-4afd-87d4-ab556d9851f9/8lYbxp0lwv.lottie" loop autoplay />
              </div>

              <h3 className="font-serif text-2xl text-foreground mb-2">
                {modalType === "resumes" ? "Pipeline History" : "System Config"}
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                {modalType === "resumes" 
                  ? "Our engineering team is finalizing the timeline view for past telemetry." 
                  : "Session management and Sign Out actions are being moved here for security."}
              </p>

              <Button onClick={() => setModalOpen(false)} className="w-full bg-primary text-primary-foreground font-bold h-11 rounded-xl">
                Acknowledge
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}