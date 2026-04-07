"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, UploadCloud, Briefcase, ArrowRight,
  X, AlertCircle, CheckCircle2, Target, ShieldCheck,
  Zap, Activity, Lock, ChevronRight, BarChart3, Terminal,
  RefreshCw, ArrowLeft
} from "lucide-react";
import { analyzeResumeAsGuest } from "@/app/actions/guest-analyze";
import { cn } from "@/lib/utils";

const MAX_FREE = 3;
const STORAGE_KEY = "resumai_guest_count";

// ─── Isolated JD textarea ───
const JDInput = memo(function JDInput({
  onValueChange,
  charCount,
}: {
  onValueChange: (v: string) => void;
  charCount: number;
}) {
  const [value, setValue] = useState("");
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onValueChange(e.target.value);
    },
    [onValueChange]
  );
  return (
    <div className="relative flex flex-col flex-1">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the full job description here — including requirements, responsibilities, and preferred qualifications..."
        className="flex-1 w-full bg-transparent border-none p-5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
        style={{ minHeight: 220 }}
      />
      <div className="px-5 pb-3 text-[10px] font-mono text-muted-foreground/50 text-right">
        {charCount} chars
      </div>
    </div>
  );
});

// ─── Animated analysis log ───
const LOG_STEPS = [
  "Parsing PDF structure...",
  "Extracting resume text...",
  "Tokenizing job description...",
  "Running keyword extraction...",
  "Calculating ATS match score...",
  "Detecting formatting issues...",
  "Generating recruiter feedback...",
  "Finalising report...",
];

function AnalysisLoader() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    if (step >= LOG_STEPS.length) return;
    const t = setTimeout(() => {
      setDone((d) => [...d, step]);
      setStep((s) => s + 1);
    }, 620 + Math.random() * 300);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-primary"><rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Neural Pipeline Running</h3>
        <p className="text-sm text-muted-foreground">Gemini 2.5 Flash is scanning your resume</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-2">
            resumai_engine.log
          </span>
        </div>
        <div className="p-4 space-y-2 font-mono text-xs min-h-[240px]">
          {LOG_STEPS.map((msg, i) => (
            <AnimatePresence key={i}>
              {i <= step && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {done.includes(i) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  )}
                  <span className={done.includes(i) ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                    {done.includes(i) ? "✓ " : "→ "}{msg}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
          {step < LOG_STEPS.length && (
            <motion.span
              className="inline-block w-1.5 h-3.5 bg-primary ml-1 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Score gauge (mini) ───
function MiniGauge({ score }: { score: number }) {
  const color = score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-rose-500";
  const textColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-rose-500";
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const arc = (240 / 360) * circ;
  const offset = arc - (score / 100) * arc;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full rotate-[150deg]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="5"
          strokeDasharray={`${arc} ${circ}`} className="stroke-muted/40" strokeLinecap="round" />
        <motion.circle cx="50" cy="50" r={radius} fill="none" strokeWidth="5"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className={color} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center pt-2">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-3xl font-bold font-mono tracking-tighter", textColor)}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest -mt-1">ATS</span>
      </div>
    </div>
  );
}

// ─── Locked gate ───
function LockedGate() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
          Free Scans Used
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          You've used your {MAX_FREE} free analyses. Create a free account to save your reports, access unlimited scans, and unlock the full AI recruiter experience.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
                            Create Free Account
            </motion.button>
          </Link>
          <Link href="/">
            <button className="w-full h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───
type Step = "upload" | "analyzing" | "result";

export default function TryPage() {
  const [usageCount, setUsageCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("upload");

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jd, setJd] = useState("");
  const [jdCharCount, setJdCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setUsageCount(stored);
  }, []);

  const handleJDChange = useCallback((v: string) => {
    setJd(v);
    setJdCharCount(v.length);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return; }
    setFile(f);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); setError(null);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") { setFile(f); }
    else setError("Please upload a PDF file.");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file || !jd.trim()) return;
    setError(null);
    setStep("analyzing");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobDescription", jd);

      const res = await analyzeResumeAsGuest(fd);

      if (!res.success) {
        setError(res.message);
        setStep("upload");
        return;
      }

      const newCount = usageCount + 1;
      localStorage.setItem(STORAGE_KEY, String(newCount));
      setUsageCount(newCount);
      setResult(res.data);
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("upload");
    }
  }, [file, jd, usageCount]);

  const handleReset = useCallback(() => {
    setFile(null);
    setJd("");
    setJdCharCount(0);
    setResult(null);
    setError(null);
    setStep("upload");
  }, []);

  // Hydration guard
  if (!mounted) return null;

  // Gate check
  if (usageCount >= MAX_FREE && step !== "result") return <LockedGate />;

  const remaining = Math.max(0, MAX_FREE - usageCount);
  const canAnalyze = !!file && jd.trim().length > 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* Ambient grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(to right,var(--color-foreground) 1px,transparent 1px),linear-gradient(to bottom,var(--color-foreground) 1px,transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Top glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary opacity-[0.07] blur-[100px]"
      />

      {/* Nav */}
      <header className="relative z-50 flex items-center justify-between px-6 py-5 border-b border-border bg-background/70 backdrop-blur-md">
        <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      </div>
          <span className="font-bold text-sm text-foreground">ResumAI</span>
        </div>
        <Link href="/login" className="text-xs font-bold text-primary hover:underline">
          Sign In →
        </Link>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 py-12">

        <AnimatePresence mode="wait">

          {/* ─── STEP: UPLOAD ─── */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary mb-5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Free Trial — {remaining} scan{remaining !== 1 ? "s" : ""} remaining
                </motion.div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
                  Try ResumAI Free
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-base">
                  No account needed. Upload your resume and paste a job description to get an instant AI-powered ATS analysis.
                </p>
              </div>

              {/* Usage dots */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {Array.from({ length: MAX_FREE }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-all duration-500",
                      i < usageCount ? "bg-primary/30" : "bg-primary"
                    )}
                  />
                ))}
                <span className="ml-2 text-[11px] font-mono text-muted-foreground">{remaining} left</span>
              </div>

              {/* Input panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                {/* PDF Upload */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
                  style={{ minHeight: 340 }}
                >
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Your Resume</h3>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">PDF only · max 5MB</span>
                  </div>
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-8 transition-all duration-200 m-2 rounded-xl border-2",
                      isDragging ? "bg-primary/5 border-primary border-dashed" : "border-transparent"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {!file ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                          <div className="mb-5 h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                            <UploadCloud className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-semibold text-foreground mb-1">Drop PDF here</p>
                          <p className="text-xs text-muted-foreground mb-6">or click to browse</p>
                          <label className="cursor-pointer">
                            <span className="px-5 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all">
                              Browse Files
                            </span>
                            <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileSelect} />
                          </label>
                        </motion.div>
                      ) : (
                        <motion.div key="file" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                            <FileText className="h-6 w-6" />
                          </div>
                          <p className="font-semibold text-sm text-foreground mb-1 max-w-[220px] truncate px-2">{file.name}</p>
                          <p className="text-xs text-muted-foreground mb-6">{(file.size / 1024).toFixed(0)} KB</p>
                          <button onClick={() => setFile(null)} className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-md hover:bg-rose-500/10 transition-colors">
                            <X size={14} /> Remove
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* JD Input */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
                  style={{ minHeight: 340 }}
                >
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Job Description</h3>
                    {jdCharCount > 0 && (
                      <span className="ml-auto text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Loaded
                      </span>
                    )}
                  </div>
                  <JDInput onValueChange={handleJDChange} charCount={jdCharCount} />
                </motion.div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl mb-4"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze button */}
              <div className="flex flex-col items-center">
                <motion.button
                  disabled={!canAnalyze}
                  onClick={handleAnalyze}
                  whileHover={canAnalyze ? { scale: 1.02 } : {}}
                  whileTap={canAnalyze ? { scale: 0.98 } : {}}
                  className={cn(
                    "relative h-13 px-10 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2.5 overflow-hidden",
                    canAnalyze
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {canAnalyze && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                  )}
                                    Analyze My Resume Free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <p className="mt-3 text-[11px] text-muted-foreground text-center max-w-xs">
                  No account required · Results in ~10 seconds · {remaining} free scan{remaining !== 1 ? "s" : ""} left
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── STEP: ANALYZING ─── */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl flex flex-col items-center py-12"
            >
              <AnalysisLoader />
            </motion.div>
          )}

          {/* ─── STEP: RESULT ─── */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl"
            >
              {/* Result header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card border border-border rounded-2xl p-8 mb-6 shadow-sm">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Scan_Complete
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2 capitalize">
                    {result.file_name.replace(".pdf", "")}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {result.summary_feedback}
                  </p>
                  <div className="flex gap-2 mt-5 flex-wrap">
                    <button
                      onClick={handleReset}
                      disabled={usageCount >= MAX_FREE}
                      className={cn(
                        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-sm",
                        usageCount >= MAX_FREE && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {usageCount >= MAX_FREE ? "No Scans Left" : `New Scan (${MAX_FREE - usageCount} left)`}
                    </button>
                    <Link href="/login">
                      <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        Save Report — Sign Up Free
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="shrink-0">
                  <MiniGauge score={result.ats_score} />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-6 shadow-sm">
                {[
                  { label: "ATS Score", value: `${result.ats_score}%`, icon: <Activity className="h-4 w-4" /> },
                  { label: "Years of Exp.", value: `${result.calculated_yoe} yrs`, icon: <Zap className="h-4 w-4" /> },
                  { label: "Skills Matched", value: result.skills_found.length.toString(), icon: <BarChart3 className="h-4 w-4" /> },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card p-5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{stat.label}</p>
                      <p className="text-xl font-bold font-mono tracking-tighter">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Formatting Issues */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-5">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Structural Integrity
                  </h3>
                  {result.formatting_issues.length > 0 ? (
                    <div className="space-y-3">
                      {result.formatting_issues.map((iss: string, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                          className="flex gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-sm leading-relaxed"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{iss}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-2" />
                      <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Parsing Optimal</p>
                      <p className="text-xs text-muted-foreground mt-1">No ATS-hostile formatting detected.</p>
                    </div>
                  )}
                </div>

                {/* Keyword grid */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-5">
                    <Target className="w-4 h-4 text-primary" /> Keyword Gap Analysis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Matched ({result.skills_found.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skills_found.slice(0, 8).map((s: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                            {s}
                          </span>
                        ))}
                        {result.skills_found.length > 8 && (
                          <span className="px-2 py-1 rounded-md bg-muted border border-border text-[11px] font-mono text-muted-foreground">+{result.skills_found.length - 8} more</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Missing ({result.missing_keywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missing_keywords.slice(0, 8).map((k: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-700 dark:text-rose-400">
                            {k.replace(/\[REQUIRED\]\s?|\[PREFERRED\]\s?/g, "")}
                          </span>
                        ))}
                        {result.missing_keywords.length > 8 && (
                          <span className="px-2 py-1 rounded-md bg-muted border border-border text-[11px] font-mono text-muted-foreground">+{result.missing_keywords.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signup CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden bg-card border border-primary/20 rounded-2xl p-8 text-center shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
                    Full Report Locked
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                    Want to save this & get more details?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                    Create a free account to save all your reports, access the AI Resume Copilot, get full keyword breakdowns, and run unlimited analyses.
                  </p>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                                            Create Free Account
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <p className="mt-3 text-[11px] text-muted-foreground">No credit card required · Free forever plan</p>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
