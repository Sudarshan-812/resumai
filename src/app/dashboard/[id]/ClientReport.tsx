"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import AiAssistant from "@/app/dashboard/AiAssistant";
import LaTeXViewer from "./LaTeXViewer";
import DashboardShell from "@/app/dashboard/DashboardShell";
import {
  Download, X, CheckCircle2, Copy,
  FileText, AlertCircle, ArrowLeft,
  ChevronRight, ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ResumeData { id: string; file_name: string }
interface AnalysisData {
  ats_score: number;
  summary_feedback: string;
  skills_found: string[];
  missing_keywords: string[];
  formatting_issues: string[];
  calculated_yoe: number;
}

/* ─── Count-up sub-component (safe in .map) ─────────────────── */
function CountUpNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    if (value === 0) return;
    const t0 = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Score Ring ─────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!score) return;
    let frameId: number;
    const tid = setTimeout(() => {
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * score));
        if (p < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, 300);
    return () => { clearTimeout(tid); cancelAnimationFrame(frameId); };
  }, [score]);

  const color =
    score >= 80 ? { stroke: "stroke-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Strong Match" }
    : score >= 60 ? { stroke: "stroke-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Partial Match" }
    : { stroke: "stroke-rose-500", text: "text-rose-600 dark:text-rose-400", label: "Weak Match" };

  const r    = 52;
  const circ = 2 * Math.PI * r;
  const arc  = (260 / 360) * circ;
  const off  = arc - (display / 100) * arc;

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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 20 }}
            className={cn("text-4xl font-black font-mono tracking-tighter tabular-nums", color.text)}
          >
            {display}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className={cn("text-xs font-semibold", color.text)}>{color.label}</span>
    </div>
  );
}

/* ─── Keyword Chip ─────────────────────────────────────────── */
function Chip({ label, variant, index = 0 }: { label: string; variant: "match" | "missing"; index?: number }) {
  const clean = label.replace(/\[REQUIRED\]\s?|\[PREFERRED\]\s?/g, "");
  const isRequired = label.includes("[REQUIRED]");
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border",
        variant === "match"
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          : isRequired
            ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400"
            : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
      )}
    >
      {variant === "match"
        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
        : <AlertCircle className="w-3 h-3 shrink-0" />
      }
      {clean}
    </motion.span>
  );
}

/* ─── AI Split View ──────────────────────────────────────── */
function AiSplitView({ onClose, resume }: { onClose: () => void; resume: ResumeData }) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [latexCode, setLatexCode] = useState("");
  const [isLatexLoading, setIsLatexLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLatexLoading(true);
    fetch("/api/resume-latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: resume.id }),
    })
      .then(r => r.json())
      .then(data => { if (!cancelled && data.latex) setLatexCode(data.latex); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLatexLoading(false); });
    return () => { cancelled = true; };
  }, [resume.id]);

  const handleDownload = () => {
    const blob = new Blob([latexCode || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.file_name.replace(/\.[^.]+$/, "") + ".tex";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[150] bg-background flex flex-col"
    >
      <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-5 bg-background">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </motion.button>
          <div>
            <p className="text-[14px] font-semibold text-foreground leading-none">Resumai Copilot</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Resume on left · Chat on right</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={isAiLoading ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="hidden sm:flex items-center gap-1.5 text-[11px] text-blue-500 font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI analyzing your resume…
          </motion.div>
          {latexCode && (
            <motion.button
              onClick={handleDownload}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Download .tex</span>
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:flex flex-col border-r border-border overflow-hidden">
          <LaTeXViewer code={latexCode} fileName={resume.file_name} isLoading={isLatexLoading} isAiLoading={isAiLoading} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <AiAssistant resumeId={resume.id} onLoadingChange={setIsAiLoading} latexCode={latexCode} onLatexChange={setLatexCode} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Report ────────────────────────────────────────── */
export default function ClientReport({
  resume, analysis, truncated = false,
}: {
  resume: ResumeData; analysis: AnalysisData; truncated?: boolean;
}) {
  const [tab, setTab]             = useState<"summary" | "keywords" | "formatting">("summary");
  const [aiViewOpen, setAiViewOpen] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [truncWarn, setTruncWarn] = useState(truncated);

  const score    = analysis.ats_score        || 0;
  const skills   = analysis.skills_found     || [];
  const missing  = analysis.missing_keywords || [];
  const issues   = analysis.formatting_issues || [];
  const feedback = analysis.summary_feedback  || "";
  const yoe      = analysis.calculated_yoe   || 0;
  const fileName = resume.file_name.replace(".pdf", "");

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

  const STATS = [
    { label: "ATS Score",    numVal: score,         suffix: "%" },
    { label: "Experience",   numVal: yoe,            suffix: " yrs" },
    { label: "Skills found", numVal: skills.length,  suffix: "" },
  ];

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All analyses
        </Link>

        <AnimatePresence>
          {truncWarn && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-300 rounded-xl px-4 py-3 mb-6 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="flex-1">
                Your resume is very long — only the first 150,000 characters were analysed. For best results, ensure your resume is concise.
              </span>
              <motion.button
                onClick={() => setTruncWarn(false)}
                whileTap={{ scale: 0.9 }}
                className="ml-2 text-amber-600 dark:text-amber-400 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

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
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl line-clamp-3">{feedback}</p>
            <div className="flex items-center gap-2 mt-5">
              <motion.button
                onClick={handleExport}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </motion.button>
              <motion.button
                onClick={handleCopy}
                whileTap={{ scale: 0.94 }}
                animate={copied ? { scale: [1, 1.08, 1] } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-background text-xs font-medium transition-colors",
                  copied
                    ? "border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border-border text-foreground hover:bg-muted"
                )}
              >
                <motion.span
                  key={copied ? "check" : "copy"}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </motion.span>
                {copied ? "Copied" : "Copy JSON"}
              </motion.button>
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
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
              className="bg-card px-6 py-5"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold font-mono tracking-tighter text-foreground">
                <CountUpNumber value={stat.numVal} />{stat.suffix}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit">
              {TABS.map(t => (
                <motion.button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "relative px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    tab === t.id
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.id === "formatting" && issues.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center"
                    >
                      {issues.length}
                    </motion.span>
                  )}
                </motion.button>
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
                        {skills.map((s, i) => <Chip key={i} label={s} variant="match" index={i} />)}
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
                        {missing.map((k, i) => <Chip key={i} label={k} variant="missing" index={i} />)}
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
                      {issues.map((iss, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">{iss}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex flex-col items-center py-10 text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">No formatting issues</p>
                      <p className="text-xs text-muted-foreground">Your resume is ATS-compatible.</p>
                    </motion.div>
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
              <motion.button
                onClick={() => setAiViewOpen(true)}
                whileHover={{ y: -2, boxShadow: "0 12px 32px -4px rgb(59 130 246 / 0.35)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl p-5 text-left transition-colors duration-300 shadow-lg shadow-blue-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-1 text-white/60">
                    <ArrowLeftRight size={12} />
                    <span className="text-[10px] font-medium">Split view</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white mb-1">Open Resumai Copilot</p>
                <p className="text-[11.5px] text-white/70 leading-relaxed">
                  Your resume on the left, AI chat on the right. Ask for rewrites, keywords, and more.
                </p>
                <div className="mt-4 flex items-center gap-1 text-white/80 text-[11px] font-semibold">
                  Start chatting
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
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
                ].map((row, i) => {
                  const active = score >= row.min && (row.min === 90 ? score >= 90 : score < row.min + (row.min === 75 ? 15 : row.min === 60 ? 15 : row.min === 0 ? 60 : 10));
                  return (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all",
                        active ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      <span>{row.tier}</span>
                      <span className="font-mono">{row.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {aiViewOpen && (
          <AiSplitView onClose={() => setAiViewOpen(false)} resume={resume} />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
