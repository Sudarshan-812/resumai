"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, BarChart3, UploadCloud, ChevronRight,
  Plus, CreditCard, ArrowUpRight, Zap, PenLine,
  TrendingUp, Clock, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DashboardShell from "./DashboardShell";

interface DashboardClientProps {
  user: {
    email?: string;
    user_metadata?: { avatar_url?: string; picture?: string };
  };
  profile: { full_name?: string | null; credits?: number | null } | null;
  recentResumes: Array<{
    id: string;
    file_name: string;
    created_at: string;
    ats_score?: number | null;
  }>;
  stats: { totalScans: number; avgScore: number };
}

export default function DashboardClient({ user, profile, recentResumes, stats }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const userName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const credits   = profile?.credits ?? 0;
  const { totalScans, avgScore } = stats;

  const formatDate = (ds: string) => {
    if (!mounted) return "—";
    return new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-6 py-8">

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s an overview of your resume activity.
            </p>
          </div>
          <Link href="/upload">
            <Button className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 transition-all">
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
              New Analysis
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Analyses"
            value={totalScans.toString()}
            icon={<FileText className="h-4 w-4" />}
            trend={totalScans > 0 ? `${totalScans} resume${totalScans !== 1 ? "s" : ""} scanned` : "No scans yet"}
          />
          <StatCard
            title="Avg ATS Score"
            value={avgScore > 0 ? `${avgScore}` : "—"}
            suffix={avgScore > 0 ? "/ 100" : ""}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={avgScore >= 70 ? "Above average" : avgScore > 0 ? "Needs improvement" : "Run a scan to see"}
            trendColor={avgScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : avgScore > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
          />
          <StatCard
            title="Credits Available"
            value={credits.toString()}
            icon={<CreditCard className="h-4 w-4" />}
            trend={credits <= 1 ? "Running low — top up" : `${credits} scans remaining`}
            trendColor={credits <= 1 ? "text-amber-600 dark:text-amber-400" : undefined}
            action={
              <Link href="/billing" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                Top up
              </Link>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="group relative overflow-hidden rounded-2xl border border-dashed border-border bg-card hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all p-6 flex items-center gap-5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <UploadCloud size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Analyze a new resume</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upload your PDF and paste a job description to get your ATS score and AI suggestions.</p>
              </div>
              <Link href="/upload">
                <Button variant="outline" className="h-9 px-4 text-sm font-semibold rounded-xl border-border shrink-0">
                  Upload PDF
                </Button>
              </Link>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 px-0.5">
                <h2 className="text-sm font-bold text-foreground">Recent Analyses</h2>
                {recentResumes.length > 0 && (
                  <Link href="/history" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                    View all <ChevronRight size={11} />
                  </Link>
                )}
              </div>

              {recentResumes.length === 0 ? (
                <EmptyAnalyses />
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  {recentResumes.map((resume, i) => {
                    const score = resume.ats_score ?? 0;
                    const scoreColor =
                      score >= 75 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : score >= 55 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";

                    return (
                      <Link
                        key={resume.id}
                        href={`/dashboard/${resume.id}`}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group",
                          i < recentResumes.length - 1 && "border-b border-border"
                        )}
                      >
                        <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-blue-600 group-hover:border-blue-500/30 transition-colors shrink-0">
                          <FileText size={16} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={resume.file_name}>
                            {resume.file_name.replace(/\.pdf$/i, "")}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(resume.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold border tabular-nums", scoreColor)}>
                            {score > 0 ? `${score}/100` : "—"}
                          </span>
                          <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-blue-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">AI Tools</h3>
              </div>
              <div className="space-y-1.5">
                <ToolButton
                  icon={<PenLine size={15} />}
                  label="Cover Letter Generator"
                  sub="Role-specific in seconds"
                  onClick={() => router.push("/dashboard/cover-letter")}
                />
                <ToolButton
                  icon={<BarChart3 size={15} />}
                  label="Interview Simulator"
                  sub="Practice with AI feedback"
                  onClick={() => router.push("/dashboard/interview")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-4">Pro Tips</h3>
              <ul className="space-y-3">
                {[
                  "Tailor your resume for each role — generic resumes score 20–30 pts lower.",
                  "Add measurable metrics to every bullet point.",
                  "Use keywords verbatim from the job description.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, value, suffix, icon, trend, trendColor, action }: {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        {action}
      </div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      {trend && (
        <p className={cn("text-[10px] mt-1 font-medium", trendColor ?? "text-muted-foreground/60")}>{trend}</p>
      )}
    </motion.div>
  );
}

function EmptyAnalyses() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-border text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
        <FileText size={24} className="text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No analyses yet</p>
      <p className="text-[12px] text-muted-foreground mb-5 max-w-[220px] leading-relaxed">
        Upload your first resume to see your ATS score and AI feedback.
      </p>
      <Link href="/upload">
        <Button className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
          <UploadCloud size={14} className="mr-1.5" />
          Analyze My Resume
        </Button>
      </Link>
    </motion.div>
  );
}

function ToolButton({ icon, label, sub, onClick }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
    >
      <span className="text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold text-foreground leading-none mb-0.5">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <ArrowUpRight size={13} className="text-muted-foreground/30 group-hover:text-blue-500 transition-colors shrink-0" />
    </button>
  );
}
