"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiAssistant from "@/app/(shell)/dashboard/AiAssistant";
import LaTeXViewer from "./LaTeXViewer";
import {
  DownloadSimple as Download, X, CheckCircle as CheckCircle2, Copy, WarningCircle as AlertCircle,
  ArrowLeft, CaretRight as ChevronRight, ChatCircle as MessageSquare,
} from "@phosphor-icons/react";
import Link from "next/link";
import { SpotlightCard } from "@/components/dashboard/spotlight-card";
import { NumberTicker } from "@/components/dashboard/number-ticker";

const SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

interface ResumeData { id: string; file_name: string }
interface AnalysisData {
  ats_score: number;
  summary_feedback: string;
  skills_found: string[];
  missing_keywords: string[];
  formatting_issues: string[];
  calculated_yoe: number;
}

function scoreCfg(s: number) {
  if (s >= 80) return { label: "Strong Match", color: "#059669", dim: "rgba(5,150,105,0.10)", border: "rgba(5,150,105,0.22)" };
  if (s >= 60) return { label: "Good Match",   color: "#d97706", dim: "rgba(217,119,6,0.10)",  border: "rgba(217,119,6,0.22)"  };
  return          { label: "Needs Work",       color: "#e11d48", dim: "rgba(225,29,72,0.10)",  border: "rgba(225,29,72,0.22)"  };
}

/* ── Keyword chip ──────────────────────────────────────────── */
function Chip({ label, variant, index = 0 }: { label: string; variant: "match" | "missing"; index?: number }) {
  const clean      = label.replace(/\[REQUIRED\]\s?|\[PREFERRED\]\s?/g, "");
  const isRequired = label.includes("[REQUIRED]");
  const s = variant === "match"
    ? { bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.22)", color: "#059669" }
    : isRequired
    ? { bg: "rgba(225,29,72,0.08)",  border: "rgba(225,29,72,0.22)", color: "#e11d48" }
    : { bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.22)", color: "#d97706" };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.82, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 380, damping: 22 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {variant === "match" ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
      {clean}
    </motion.span>
  );
}

/* ── Breakdown stat ───────────────────────────────────────── */
function BreakdownStat({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
    >
      <p className="text-[9px] font-mono uppercase tracking-[0.16em] mb-2 text-muted-foreground/60">{label}</p>
      <NumberTicker value={pct} suffix="%" duration={1000} delay={delay * 1000}
        className="font-black" style={{ fontSize: 32, fontFamily: "monospace", letterSpacing: "-0.04em", color } as React.CSSProperties} />
      <div className="mt-2.5 h-[3px] rounded-full overflow-hidden bg-border">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: EASE, delay: delay + 0.1 }}
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

/* ── AI Split View ─────────────────────────────────────────── */
function AiSplitView({ onClose, resume }: { onClose: () => void; resume: ResumeData }) {
  const [isAiLoading, setIsAiLoading]       = useState(false);
  const [latexCode, setLatexCode]           = useState("");
  const [isLatexLoading, setIsLatexLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resume-latex", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: resume.id }),
    })
      .then(r => r.json())
      .then(d => { if (!cancelled && d.latex) setLatexCode(d.latex); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLatexLoading(false); });
    return () => { cancelled = true; };
  }, [resume.id]);

  const handleDownload = () => {
    const blob = new Blob([latexCode], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = resume.file_name.replace(/\.[^.]+$/, "") + ".tex";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="fixed inset-0 z-[150] flex flex-col bg-background"
    >
      <div className="h-14 shrink-0 flex items-center justify-between px-5 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
            transition={SPRING}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </motion.button>
          <div>
            <p className="text-[14px] font-semibold leading-none text-foreground">Resume Copilot</p>
            <p className="text-[10px] mt-0.5 text-muted-foreground">Your resume · left  ·  chat · right</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isAiLoading && (
              <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                Thinking…
              </motion.div>
            )}
          </AnimatePresence>
          {latexCode && (
            <motion.button onClick={handleDownload} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[11px] font-semibold border border-border text-muted-foreground bg-card">
              <Download size={15} /><span className="hidden sm:inline">Download .tex</span>
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:flex flex-col overflow-hidden border-r border-border">
          <LaTeXViewer code={latexCode} fileName={resume.file_name} isLoading={isLatexLoading} isAiLoading={isAiLoading} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <AiAssistant resumeId={resume.id} onLoadingChange={setIsAiLoading} latexCode={latexCode} onLatexChange={setLatexCode} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function ClientReport({
  resume, analysis, truncated = false,
}: {
  resume: ResumeData; analysis: AnalysisData; truncated?: boolean;
}) {
  const [tab, setTab]               = useState<"summary" | "keywords" | "formatting">("summary");
  const [aiViewOpen, setAiViewOpen] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [truncWarn, setTruncWarn]   = useState(truncated);
  const [scoreDone, setScoreDone]   = useState(false);

  const score    = analysis.ats_score         ?? 0;
  const skills   = analysis.skills_found      ?? [];
  const missing  = analysis.missing_keywords  ?? [];
  const issues   = analysis.formatting_issues ?? [];
  const feedback = analysis.summary_feedback  ?? "";
  const yoe      = analysis.calculated_yoe    ?? 0;
  const fileName = resume.file_name.replace(/\.pdf$/i, "");
  const cfg      = scoreCfg(score);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify({ fileName, analysis }, null, 2)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2200);
    });
  }, [fileName, analysis]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify({ fileName, analysis }, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `${fileName}_analysis.json`; a.click(); URL.revokeObjectURL(url);
  }, [fileName, analysis]);

  const TABS: { id: "summary" | "keywords" | "formatting"; label: string; count?: number }[] = [
    { id: "summary",    label: "Summary"     },
    { id: "keywords",   label: "Keywords",   count: skills.length  },
    { id: "formatting", label: "Formatting", count: issues.length || undefined },
  ];

  const breakdown = [
    { label: "Keyword Match",  pct: Math.round((skills.length / Math.max(skills.length + missing.length, 1)) * 100) },
    { label: "Experience",     pct: Math.min(100, yoe > 0 ? 75 : 38) },
    { label: "Skills Depth",   pct: Math.min(100, skills.length > 5 ? 80 : skills.length * 13) },
    { label: "Formatting",     pct: Math.max(0, 100 - issues.length * 15) },
  ];

  return (
    <>
      <div className="bg-background min-h-full">

        {/* ── Colored accent stripe (score-based) ── */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ height: 3, background: cfg.color, transformOrigin: "left" }}
        />

        {/* ── Score hero ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-6 md:px-10">

            {/* Nav */}
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-4 border-b border-border/60"
            >
              <Link href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium group text-muted-foreground">
                <motion.span whileHover={{ x: -3 }} transition={SPRING}>
                  <ArrowLeft size={16} />
                </motion.span>
                All reports
              </Link>
              <div className="flex items-center gap-2">
                <motion.button onClick={handleExport}
                  whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                  className="h-8 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-border text-muted-foreground">
                  <Download size={14} /> Export
                </motion.button>
                <motion.button onClick={handleCopy}
                  whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                  className={`h-8 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
                    copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground"
                  }`}>
                  <motion.span key={copied ? "c" : "u"} initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING}>
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </motion.span>
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </motion.div>

            {/* Truncation warning */}
            <AnimatePresence>
              {truncWarn && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm overflow-hidden bg-amber-500/5 border border-amber-500/20 text-amber-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="flex-1 text-[13px]">Resume was too long — only first 150,000 characters were analysed.</span>
                  <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setTruncWarn(false)} className="opacity-50">
                    <X size={16} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title + Score card */}
            <SpotlightCard className="mt-7 mb-6 p-6" spotlightColor={`${cfg.color}18`}>
              <div className="flex items-start justify-between gap-6">
                {/* Left: label + name + verdict */}
                <motion.div
                  className="min-w-0 flex-1"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 24 }}
                >
                  <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-3 text-muted-foreground/60">
                    ATS Report
                  </p>
                  <h1 className="font-display font-semibold tracking-tight capitalize text-foreground"
                    style={{ fontSize: "clamp(19px, 3.2vw, 28px)", lineHeight: 1.22 }}>
                    {fileName}
                  </h1>
                  <p className="mt-3 text-[13px] leading-[1.75] line-clamp-2 text-muted-foreground">
                    {feedback}
                  </p>
                </motion.div>

                {/* Right: animated score */}
                <motion.div
                  className="shrink-0 flex flex-col items-end gap-2.5"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 24 }}
                >
                  <div className="flex items-end gap-1 leading-none">
                    <NumberTicker
                      value={score} duration={1000} delay={300} onComplete={() => setScoreDone(true)}
                      className="font-black" style={{ fontSize: 64, fontFamily: "monospace", letterSpacing: "-0.04em", color: cfg.color } as React.CSSProperties}
                    />
                    <span className="text-[14px] font-semibold pb-1.5 text-muted-foreground/40">/100</span>
                  </div>

                  {/* Badge — pops in after score settles */}
                  <AnimatePresence>
                    {scoreDone && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: cfg.dim, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Progress bar */}
                  <div className="w-24 h-[3px] rounded-full overflow-hidden bg-border">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.4, ease: EASE, delay: 0.35 }}
                      style={{ background: cfg.color }}
                    />
                  </div>
                </motion.div>
              </div>
            </SpotlightCard>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 26 }}
              className="flex items-center gap-1 pb-5 flex-wrap"
            >
              {[
                { label: "Experience",  val: `${yoe} yrs`,                                  c: "#60646c" },
                { label: "Matched",     val: `${skills.length} skills`,                      c: "#059669" },
                { label: "Missing",     val: `${missing.length} keywords`,                   c: "#d97706" },
                { label: "Formatting",  val: issues.length === 0 ? "All good" : `${issues.length} issues`, c: issues.length === 0 ? "#059669" : "#e11d48" },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.c }} />
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: s.c }}>{s.val}</span>
                  </div>
                  {i < 3 && <span className="text-[10px] px-1 text-border">·</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8">

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 mb-10">
            {breakdown.map((row, i) => {
              const c = row.pct >= 75 ? "#059669" : row.pct >= 50 ? "#d97706" : "#e11d48";
              return <BreakdownStat key={row.label} label={row.label} pct={row.pct} color={c} delay={0.28 + i * 0.08} />;
            })}
          </div>

          <div className="h-px bg-border mb-8" />

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.34, duration: 0.3 }}
          >
            <div className="flex items-center gap-6 mb-6 border-b border-border">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative pb-3.5 text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                  style={{ color: tab === t.id ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {t.label}
                  {t.count !== undefined && (
                    <motion.span
                      layout
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        t.id === "formatting" && issues.length > 0 ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"
                      }`}>
                      {t.count}
                    </motion.span>
                  )}
                  {tab === t.id && (
                    <motion.div layoutId="tab-ul"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 440, damping: 34 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {tab === "summary" && (
                <motion.div key="s"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="pb-4"
                >
                  <p className="text-[14px] leading-[1.9] text-muted-foreground">{feedback}</p>
                </motion.div>
              )}

              {tab === "keywords" && (
                <motion.div key="k"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="pb-4 space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <motion.span className="w-2 h-2 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                        Matched — {skills.length}
                      </span>
                    </div>
                    {skills.length > 0
                      ? <div className="flex flex-wrap gap-2">{skills.map((s, i) => <Chip key={i} label={s} variant="match" index={i} />)}</div>
                      : <p className="text-[13px] text-muted-foreground">No skills matched.</p>
                    }
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <motion.span className="w-2 h-2 rounded-full bg-rose-600"
                        animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                        Missing — {missing.length}
                      </span>
                    </div>
                    {missing.length > 0
                      ? <div className="flex flex-wrap gap-2">{missing.map((k, i) => <Chip key={i} label={k} variant="missing" index={i} />)}</div>
                      : <p className="text-[13px] text-muted-foreground">Nothing missing — great coverage.</p>
                    }
                  </div>
                </motion.div>
              )}

              {tab === "formatting" && (
                <motion.div key="f"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="pb-4"
                >
                  {issues.length > 0 ? issues.map((iss, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 26 }}
                      className={`flex gap-4 py-5 ${i < issues.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <motion.div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/10"
                        animate={{ rotate: [0, -8, 8, 0] }}
                        transition={{ delay: i * 0.07 + 0.4, duration: 0.4 }}
                      >
                        <AlertCircle size={13} className="text-rose-600" />
                      </motion.div>
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-[0.12em] mb-1.5 text-rose-600">Issue {i + 1}</p>
                        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{iss}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="flex items-center gap-3 py-5">
                      <motion.div animate={{ rotate: [0, 10, -6, 0] }} transition={{ delay: 0.3, duration: 0.5 }}>
                        <CheckCircle2 size={24} className="text-emerald-600" />
                      </motion.div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">Formatting looks clean</p>
                        <p className="text-[12px] mt-0.5 text-muted-foreground">Passed all ATS formatting checks.</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          {/* ── Chat CTA ── */}
          <motion.button
            onClick={() => setAiViewOpen(true)}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 240, damping: 24 }}
            whileHover={{ y: -3, boxShadow: "0 20px 48px rgba(18,165,148,0.22)" }}
            whileTap={{ scale: 0.98 }}
            className="group w-full mt-10 mb-6 rounded-2xl px-6 py-5 flex items-center justify-between text-left"
            style={{
              background: "linear-gradient(135deg, #12a594 0%, #008573 100%)",
              boxShadow: "0 6px 24px rgba(18,165,148,0.16)",
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15"
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <MessageSquare size={22} className="text-white" />
              </motion.div>
              <div>
                <p className="text-[14px] font-bold text-white leading-tight">Chat with your resume</p>
                <p className="text-[11px] mt-0.5 text-white/62">
                  Ask what to fix, rewrite sections, get it job-ready.
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="shrink-0 text-white/45 group-hover:translate-x-1.5 transition-transform duration-200" />
          </motion.button>

          <div className="h-6" />
        </div>
      </div>

      <AnimatePresence>
        {aiViewOpen && <AiSplitView onClose={() => setAiViewOpen(false)} resume={resume} />}
      </AnimatePresence>
    </>
  );
}
