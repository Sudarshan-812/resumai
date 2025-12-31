"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, BarChart3, Sparkles, UploadCloud, 
  ChevronRight, Settings, Plus, X, Crown, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Import Navbar
import DashboardNavbar from "./dashboard-navbar";

interface DashboardClientProps {
  user: any;
  profile: any;
  recentResumes: any[];
  stats: {
    totalScans: number;
    avgScore: number;
  };
}

export default function DashboardClient({ user, profile, recentResumes, stats }: DashboardClientProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const userName = profile?.full_name?.split(' ')[0] || "Developer";
  const credits = profile?.credits ?? 0;
  const { totalScans, avgScore } = stats;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const cleanFileName = (name: string) => {
    return name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-900">
      
      {/* Navbar */}
      <DashboardNavbar 
        userProfile={{
          name: userName,
          email: user.email,
          credits: credits,
          initial: userName[0] || "D"
        }}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-8 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {userName}. You're doing great.</p>
          </div>
          <Link href="/upload">
            <Button className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6">
              <Plus className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* 1. Stats Overview Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <StatCard 
            title="Total Analyses" 
            value={totalScans.toString()} 
            icon={<FileText className="h-5 w-5 text-blue-500" />} 
          />
          <StatCard 
            title="Average ATS Score" 
            value={`${avgScore}`} 
            suffix="/100" 
            icon={<BarChart3 className="h-5 w-5 text-emerald-500" />} 
            trend={avgScore > 70 ? "Good" : "Needs Work"} 
            trendColor={avgScore > 70 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"} 
          />
          <StatCard 
            title="Credits Remaining" 
            value={credits.toString()} 
            icon={<CreditCard className="h-5 w-5 text-amber-500" />} 
            action={
              /* UPDATED LINK HERE */
              <Link href="/billing" className="text-xs font-medium text-indigo-600 hover:underline">
                Buy more
              </Link>
            } 
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-2">
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center sm:text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Upload a new resume</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md">
                    Drop your PDF here to get an instant ATS analysis and AI improvement suggestions.
                  </p>
                </div>
                <Link href="/upload">
                  <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300">
                    Select File
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Recent Activity</h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {recentResumes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">No resumes found</p>
                    <p className="text-xs text-gray-500 mt-1">Upload your first resume to get started.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentResumes.map((resume) => (
                      <Link 
                        key={resume.id} 
                        href={`/dashboard/${resume.id}`}
                        className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 capitalize">
                              {cleanFileName(resume.file_name)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(resume.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            resume.ats_score >= 80 ? "bg-emerald-50 text-emerald-700" :
                            resume.ats_score >= 60 ? "bg-amber-50 text-amber-700" :
                            "bg-rose-50 text-rose-700"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              resume.ats_score >= 80 ? "bg-emerald-500" :
                              resume.ats_score >= 60 ? "bg-amber-500" :
                              "bg-rose-500"
                            )} />
                            Score: {resume.ats_score}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Quick Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Quick Tools</h3>
              <div className="space-y-2">
                <QuickAction icon={<FileText className="text-purple-600" />} label="Cover Letter Gen" onClick={() => setToolModalOpen(true)} />
                <QuickAction icon={<BarChart3 className="text-blue-600" />} label="Interview Prep" onClick={() => setToolModalOpen(true)} />
                <QuickAction icon={<Sparkles className="text-amber-600" />} label="Resume Rewrite" onClick={() => setToolModalOpen(true)} />
                <QuickAction icon={<Settings className="text-slate-600" />} label="Profile Settings" onClick={() => setToolModalOpen(true)} />
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Crown className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-lg font-bold">Go Pro</h3>
              <p className="mb-4 text-sm text-indigo-100">Unlock unlimited scans.</p>
              {/* UPDATED LINK HERE */}
              <Link href="/billing">
                <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* --- QUICK TOOLS COMING SOON MODAL --- */}
      <AnimatePresence>
        {toolModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToolModalOpen(false)}
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
                onClick={() => setToolModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto h-72 w-72">
                <DotLottieReact
                  src="https://lottie.host/494878ca-55d5-4afd-87d4-ab556d9851f9/8lYbxp0lwv.lottie"
                  loop
                  autoplay
                  className="h-full w-full"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">Feature Coming Soon</h3>
              <p className="text-slate-500 mb-6 px-4">
                This AI tool is currently being built. Stay tuned for updates!
              </p>
              <Button onClick={() => setToolModalOpen(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers
function StatCard({ title, value, icon, suffix, trend, trendColor, action }: any) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-gray-500">{title}</p>{icon}</div>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-slate-900">{value}</span>{suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}</div>
        {trend && <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", trendColor)}>{trend}</span>}
        {action}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-gray-200 hover:bg-white hover:shadow-sm">
      {icon} {label}
    </button>
  );
}