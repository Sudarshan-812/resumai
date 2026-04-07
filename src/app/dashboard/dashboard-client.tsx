"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, BarChart3, UploadCloud,
  ChevronRight, Settings, Plus, Crown, CreditCard,
  ArrowUpRight, Activity, Zap, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const formatSystemDate = (dateString: string) => {
    if (!mounted) return "00_AAA_0000";
    return new Date(dateString)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      .toUpperCase()
      .replace(/ /g, '_');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      
      {/* FIXED: Removed onSignOut and isSigningOut props to match refactored Navbar */}
      <DashboardNavbar
        userProfile={{
          name: userName,
          email: user.email,
          credits: credits,
          initial: userName[0] || "D",
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        }}
      />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        
        {/* ─── DASHBOARD HEADER ─── */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
               <Activity size={12} />
               System Dashboard
            </div>
            <h1 className="font-serif text-4xl text-foreground tracking-tight">
              Welcome back, <span className="text-primary italic">{userName}.</span>
            </h1>
          </div>
          
          <Link href="/upload">
            <Button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
              <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
              Initiate New Scan
            </Button>
          </Link>
        </header>

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-10 shadow-sm">
          <StatCard 
            title="Total Analyses" 
            value={totalScans.toString()} 
            icon={<FileText className="h-4 w-4" />} 
          />
          <StatCard 
            title="Avg ATS Performance" 
            value={`${avgScore}`} 
            suffix="%" 
            icon={<Zap className="h-4 w-4" />} 
          />
          <StatCard 
            title="Available Credits" 
            value={credits.toString()} 
            icon={<CreditCard className="h-4 w-4" />} 
            action={
              <Link href="/billing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                Refill
              </Link>
            } 
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm transition-all hover:border-primary/30">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-8 bg-card rounded-[14px]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <UploadCloud strokeWidth={1.5} className="h-7 w-7" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">Deploy a new analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Upload your latest CV to generate a deterministic gap analysis and AI bullet rewrites.
                  </p>
                </div>
                <Link href="/upload">
                  <Button variant="outline" className="h-10 border-border bg-background text-foreground hover:bg-muted rounded-lg font-bold px-6">
                    Select PDF
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Recent Pipeline Activity</h3>
                <Link href="/history" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">View All</Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                {recentResumes.length === 0 ? (
                  <div className="py-16 text-center">
                     <FileText className="mx-auto h-10 w-10 text-muted/30 mb-4" strokeWidth={1} />
                     <p className="text-sm text-muted-foreground font-medium">No telemetry data available yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {recentResumes.map((resume) => (
                      <Link 
                        key={resume.id} 
                        href={`/dashboard/${resume.id}`} 
                        className="flex items-center justify-between p-5 hover:bg-muted/50 border-b last:border-0 border-border transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                            <FileText className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground capitalize tracking-tight">{resume.file_name.replace('.pdf', '')}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                              Processed: {formatSystemDate(resume.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border",
                             resume.ats_score >= 70 
                               ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                               : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                           )}>
                             ATS_{resume.ats_score}
                           </div>
                           <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
             <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                   <Zap size={14} className="text-primary" />
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Advanced Toolset</h4>
                </div>
                <div className="space-y-2">
                   <QuickAction icon={<FileText size={16} />} label="Cover Letter Gen" onClick={() => router.push('/dashboard/cover-letter')} />
                   <QuickAction icon={<BarChart3 size={16} />} label="Interview Simulator" onClick={() => router.push('/dashboard/interview')} />
                   <QuickAction icon={<Settings size={16} />} label="Profile Config" onClick={() => router.push('/settings')} />
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                   <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                         <Crown size={12} className="text-amber-500" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Pro Access</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                         Unlock infinite scans and deep reasoning logs with our enterprise tier.
                      </p>
                      {/* Added Sign Out here temporarily so you aren't locked in while we build the Config modal */}
                      <button 
                        onClick={handleSignOut} 
                        disabled={isSigningOut}
                        className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <LogOut size={12} /> {isSigningOut ? "Terminating..." : "Terminate Session"}
                      </button>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </main>

    </div>
  );
}

function StatCard({ title, value, icon, suffix, action }: any) {
  return (
    <div className="bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tighter text-foreground font-mono">{value}</span>
            {suffix && <span className="text-xs text-muted-foreground font-mono">{suffix}</span>}
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className="group flex w-full items-center justify-between rounded-xl bg-muted/30 border border-border/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted hover:border-primary/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
        {label}
      </div>
      <ArrowUpRight size={14} className="text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}