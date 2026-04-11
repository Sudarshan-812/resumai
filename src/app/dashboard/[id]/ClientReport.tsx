"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiAssistant from "@/app/dashboard/AiAssistant";
import DashboardShell from "@/app/dashboard/DashboardShell";
import {
  Download, X, CheckCircle2, Copy,
  FileText, AlertCircle, ArrowLeft,
  MessageSquare, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ScoreRing({ score }: { score: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCurrent(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 80 ? { stroke: "stroke-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Strong Match" }
    : score >= 60 ? { stroke: "stroke-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Partial Match" }
    : { stroke: "stroke-rose-500", text: "text-rose-600 dark:text-rose-400", label: "Weak Match" };

  const r   = 52;
  const circ = 2 * Math.PI * r;
  const arc  = (260 / 360) * circ;
  const off  = arc - (current / 100) * arc;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full rotate-[130deg]" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="6"
            strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
            className="stroke-muted/30" />
          <motion.circle cx="60" cy="60" r={r} fill="none" strokeWidth="6"
            strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
            initial={{ strokeDashoffset: arc }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className={color.stroke} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pt-3">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn("text-4xl font-black font-mono tracking-tighter", color.text)}
          >
            {current}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className={cn("text-xs font-semibold", color.text)}>{color.label}</span>
    </div>
  );
}

function ChatPanel({ onClose, resumeId }: { onClose: () => void; resumeId: string }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="fixed top-4 right-4 bottom-4 w-full max-w-[400px] bg-card rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden border border-border"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Assistant</p>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <AiAssistant resumeId={resumeId} />
        </div>
      </motion.div>
    </>
  );
}

function Chip({ label, variant }: { label: string; variant: "match" | "missing" }) {
  const clean = label.replace(/\[REQUIRED\]\s?|\[PREFERRED\]\s?/g, "");
  const isRequired = label.includes("[REQUIRED]");
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border",
      variant === "match"
        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        : isRequired
          ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400"
          : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
    )}>
      {variant === "match"
        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
        : <AlertCircle className="w-3 h-3 shrink-0" />
      }
      {clean}
    </span>
  );
}

export default function ClientReport({
  resume, analysis,
}: {
  resume: any; analysis: any;
}) {
  const [tab, setTab]         = useState<"summary" | "keywords" | "formatting">("summary");
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied]   = useState(false);

  const score      = analysis.ats_score        || 0;
  const skills     = analysis.skills_found     || [];
  const missing    = analysis.missing_keywords || [];
  const issues     = analysis.formatting_issues || [];
  const feedback   = analysis.summary_feedback || "";
  const yoe        = analysis.calculated_yoe   || 0;
  const fileName   = resume.file_name.replace(".pdf", "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify({ fileName, analysis }, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [fileName, analysis]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify({ fileName, analysis }, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${fileName}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileName, analysis]);

  const TABS = [
    { id: "summary",    label: "Summary"    },
    { id: "keywords",   label: "Keywords"   },
    { id: "formatting", label: "Formatting" },
  ] as const;

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          All analyses
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Analysis Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3 capitalize truncate">
              {fileName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl line-clamp-3">
              {feedback}
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={handleCopy}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-background text-xs font-medium transition-colors",
                  copied
                    ? "border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border-border text-foreground hover:bg-muted"
                )}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>
          </div>
          <div className="shrink-0">
            <ScoreRing score={score} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-6"
        >
          {[
            { label: "ATS Score",     value: `${score}%` },
            { label: "Experience",    value: `${yoe} yrs` },
            { label: "Skills found",  value: `${skills.length}` },
          ].map(stat => (
            <div key={stat.label} className="bg-card px-6 py-5">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold font-mono tracking-tighter text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    tab === t.id
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.id === "formatting" && issues.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {issues.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {tab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
                </motion.div>
              )}

              {tab === "keywords" && (
                <motion.div
                  key="keywords"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-2xl p-6 space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Matched skills
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{skills.length}</span>
                    </div>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s: string, i: number) => <Chip key={i} label={s} variant="match" />)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No matching skills found.</p>
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Missing from resume
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{missing.length}</span>
                    </div>
                    {missing.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {missing.map((k: string, i: number) => <Chip key={i} label={k} variant="missing" />)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No missing keywords.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === "formatting" && (
                <motion.div
                  key="formatting"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  {issues.length > 0 ? (
                    <div className="space-y-3">
                      {issues.map((iss: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">{iss}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">No formatting issues</p>
                      <p className="text-xs text-muted-foreground">Your resume is ATS-compatible.</p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="space-y-4">

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setChatOpen(true)}
                className="group w-full bg-card border border-border hover:border-foreground/20 rounded-2xl p-5 text-left transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">AI Assistant</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Ask for rewrites, keyword suggestions, or cover letter help.</p>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">Score range</h4>
              <div className="space-y-1.5">
                {[
                  { label: "90 – 100", tier: "Excellent",  min: 90 },
                  { label: "75 – 89",  tier: "Good",       min: 75 },
                  { label: "60 – 74",  tier: "Fair",       min: 60 },
                  { label: "0 – 59",   tier: "Needs work", min: 0  },
                ].map(row => {
                  const active = score >= row.min && (row.min === 90 ? score >= 90 : score < row.min + (row.min === 75 ? 15 : row.min === 60 ? 15 : row.min === 0 ? 60 : 10));
                  return (
                    <div
                      key={row.label}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all",
                        active
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{row.tier}</span>
                      <span className="font-mono">{row.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} resumeId={resume.id} />}
      </AnimatePresence>
    </DashboardShell>
  );
}
