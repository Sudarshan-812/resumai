"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, BarChart3, UploadCloud, 
  ChevronRight, Settings, Plus, X, Crown, CreditCard, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-900">
      
      {/* 1. Use the shared Navbar component */}
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

      {/* 2. Content starts here with pt-28 to clear the fixed navbar */}
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-8 sm:px-6 lg:px-8 animate-in fade-in duration-700">
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {userName}. You're doing great.</p>
          </div>
          <Link href="/upload">
            <Button className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <StatCard title="Total Analyses" value={totalScans.toString()} icon={<FileText className="h-5 w-5 text-blue-500" />} />
          <StatCard title="Avg ATS Score" value={`${avgScore}`} suffix="/100" icon={<BarChart3 className="h-5 w-5 text-emerald-500" />} />
          <StatCard title="Credits" value={credits.toString()} icon={<CreditCard className="h-5 w-5 text-amber-500" />} action={<Link href="/billing" className="text-xs font-bold text-indigo-600">Buy more</Link>} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-indigo-200">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-900">Analyze a new resume</h3>
                  <p className="text-sm text-slate-500 mt-1">Get instant feedback and AI rewriting for your bullet points.</p>
                </div>
                <Link href="/upload">
                  <Button variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold">
                    Select File
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent History */}
            <div>
              <h3 className="mb-4 text-base font-bold text-slate-900">Recent Activity</h3>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                {recentResumes.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 italic">No resumes analyzed yet.</div>
                ) : (
                  recentResumes.map((resume) => (
                    <Link key={resume.id} href={`/dashboard/${resume.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 capitalize">{resume.file_name.replace('.pdf', '')}</p>
                          <p className="text-xs text-slate-500">{new Date(resume.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={cn(
                           "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                           resume.ats_score >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                         )}>Score: {resume.ats_score}</span>
                         <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tools */}
          <div className="space-y-6">
             <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Quick Tools</h4>
                <div className="space-y-2">
                   <QuickAction icon={<FileText className="text-purple-600" />} label="Cover Letter Gen" onClick={() => setToolModalOpen(true)} />
                   <QuickAction icon={<BarChart3 className="text-blue-600" />} label="Interview Prep" onClick={() => setToolModalOpen(true)} />
                   <QuickAction icon={<Settings className="text-slate-600" />} label="Profile Settings" onClick={() => setToolModalOpen(true)} />
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal (Kept from your code) */}
      <AnimatePresence>
        {toolModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setToolModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
              <button onClick={() => setToolModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X /></button>
              <div className="mx-auto h-64 w-64"><DotLottieReact src="https://lottie.host/494878ca-55d5-4afd-87d4-ab556d9851f9/8lYbxp0lwv.lottie" loop autoplay /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Feature Coming Soon</h3>
              <p className="text-sm text-slate-500 mb-6">We're tailoring this AI experience for you. Stay tuned!</p>
              <Button onClick={() => setToolModalOpen(false)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">Got it</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents
function StatCard({ title, value, icon, suffix, action }: any) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>{icon}</div>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-slate-900">{value}</span>{suffix && <span className="text-xs text-gray-400 font-bold">{suffix}</span>}</div>
        {action}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-gray-100 transition-colors">
      {icon} {label}
    </button>
  );
}