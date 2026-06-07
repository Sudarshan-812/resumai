"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import AiAssistant from "@/app/dashboard/AiAssistant";
import LaTeXViewer from "./LaTeXViewer";
import DashboardShell from "@/app/dashboard/DashboardShell";
import {
  Download, X, CheckCircle2, Copy, AlertCircle,
  ArrowLeft, ChevronRight, MessageSquare,
} from "lucide-react";
import Link from "next/link";

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
  if (s >= 80) return { label: "Strong Match", color: "#059669", glow: "rgba(5,150,105,0.22)",  dim: "rgba(5,150,105,0.10)", border: "rgba(5,150,105,0.22)" };
  if (s >= 60) return { label: "Good Match",   color: "#d97706", glow: "rgba(217,119,6,0.22)",  dim: "rgba(217,119,6,0.10)",  border: "rgba(217,119,6,0.22)"  };
  return          { label: "Needs Work",       color: "#e11d48", glow: "rgba(225,29,72,0.22)",  dim: "rgba(225,29,72,0.10)",  border: "rgba(225,29,72,0.22)"  };
}

/* ── Animated count-up number ─────────────────────────────── */
function CountUp({ to, delay = 0, suffix = "", size = 28, color = "#111111", onDone }: {
  to: number; delay?: number; suffix?: string; size?: number; color?: string; onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let f: number;
    const tid = setTimeout(() => {
      const t0 = performance.now(), dur = 1000;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) { f = requestAnimationFrame(tick); }
        else { setDone(true); onDone?.(); }
      };
      f = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => { clearTimeout(tid); cancelAnimationFrame(f); };
  }, [to, delay, onDone]);

  return (
    <motion.span
      animate={done ? { scale: [1, 1.08, 0.96, 1] } : {}}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ fontSize: size, color, fontWeight: 900, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1, display: "inline-block", tabularNums: true } as React.CSSProperties}
    >
      {n}{suffix}
    </motion.span>
  );
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
      {variant === "match" ? <CheckCircle2 size={9} className="shrink-0" /> : <AlertCircle size={9} className="shrink-0" />}
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
      <p className="text-[9px] font-mono uppercase tracking-[0.16em] mb-2" style={{ color: "#C8C4BB" }}>{label}</p>
      <CountUp to={pct} delay={delay} suffix="%" size={32} color={color} />
      <div className="mt-2.5 h-[3px] rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
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
      className="fixed inset-0 z-[150] flex flex-col"
      style={{ background: "#F7F6F2" }}
    >
      <div className="h-14 shrink-0 flex items-center justify-between px-5"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
        <div className="flex items-center gap-3">
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
            transition={SPRING}
            className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#9B9890" }}>
            <X size={16} />
          </motion.button>
          <div>
            <p className="text-[14px] font-semibold leading-none" style={{ color: "#111111" }}>Resume Copilot</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#9B9890" }}>Your resume · left  ·  chat · right</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isAiLoading && (
              <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#06b6d4" }}>
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "#06b6d4" }}
                  animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                Thinking…
              </motion.div>
            )}
          </AnimatePresence>
          {latexCode && (
            <motion.button onClick={handleDownload} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold"
              style={{ border: "1px solid #E5E3DC", color: "#6B6860", background: "#FFFFFF" }}>
              <Download size={12} /><span className="hidden sm:inline">Download .tex</span>
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:flex flex-col overflow-hidden" style={{ borderRight: "1px solid #E5E3DC" }}>
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
    <DashboardShell>
      <div style={{ background: "#F7F6F2", minHeight: "100%" }}>

        {/* ── Colored accent stripe (score-based) ── */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ height: 3, background: cfg.color, transformOrigin: "left" }}
        />

        {/* ── White header ── */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
          <div className="max-w-3xl mx-auto px-6 md:px-10">

            {/* Nav */}
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-4"
              style={{ borderBottom: "1px solid #F0EFE9" }}
            >
              <Link href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium group"
                style={{ color: "#9B9890" }}>
                <motion.span whileHover={{ x: -3 }} transition={SPRING}>
                  <ArrowLeft size={13} />
                </motion.span>
                All reports
              </Link>
              <div className="flex items-center gap-2">
                <motion.button onClick={handleExport}
                  whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                  className="h-7 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
                  style={{ border: "1px solid #E5E3DC", color: "#9B9890" }}>
                  <Download size={11} /> Export
                </motion.button>
                <motion.button onClick={handleCopy}
                  whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                  className="h-7 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  style={copied
                    ? { border: "1px solid rgba(5,150,105,0.3)", background: "rgba(5,150,105,0.07)", color: "#059669" }
                    : { border: "1px solid #E5E3DC", color: "#9B9890" }}>
                  <motion.span key={copied ? "c" : "u"} initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING}>
                    {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
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
                  className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm overflow-hidden"
                  style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span className="flex-1 text-[13px]">Resume was too long — only first 150,000 characters were analysed.</span>
                  <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setTruncWarn(false)} style={{ opacity: 0.5 }}>
                    <X size={13} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title + Score row */}
            <div className="flex items-start justify-between gap-6 pt-7 pb-6">

              {/* Left: label + name + verdict */}
              <motion.div
                className="min-w-0 flex-1"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 24 }}
              >
                <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: "#C8C4BB" }}>
                  ATS Report
                </p>
                <h1
                  className="font-display font-semibold tracking-tight capitalize"
                  style={{ color: "#111111", fontSize: "clamp(19px, 3.2vw, 28px)", lineHeight: 1.22 }}
                >
                  {fileName}
                </h1>
                <p className="mt-3 text-[13px] leading-[1.75] line-clamp-2" style={{ color: "#9B9890" }}>
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
                  <CountUp
                    to={score}
                    delay={0.3}
                    size={64}
                    color={cfg.color}
                    onDone={() => setScoreDone(true)}
                  />
                  <span className="text-[14px] font-semibold pb-1.5" style={{ color: "#D4D0C8" }}>/100</span>
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
                <div className="w-24 h-[3px] rounded-full overflow-hidden" style={{ background: "#F0EFE9" }}>
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

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 26 }}
              className="flex items-center gap-1 pb-5 flex-wrap"
            >
              {[
                { label: "Experience",  val: `${yoe} yrs`,                                  c: "#6B6860" },
                { label: "Matched",     val: `${skills.length} skills`,                      c: "#059669" },
                { label: "Missing",     val: `${missing.length} keywords`,                   c: "#d97706" },
                { label: "Formatting",  val: issues.length === 0 ? "All good" : `${issues.length} issues`, c: issues.length === 0 ? "#059669" : "#e11d48" },
              ].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "#F7F6F2" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.c }} />
                    <span className="text-[10px]" style={{ color: "#9B9890" }}>{s.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: s.c }}>{s.val}</span>
                  </div>
                  {i < 3 && <span className="text-[10px] px-1" style={{ color: "#E5E3DC" }}>·</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Cream content ── */}
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8">

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 mb-10">
            {breakdown.map((row, i) => {
              const c = row.pct >= 75 ? "#059669" : row.pct >= 50 ? "#d97706" : "#e11d48";
              return <BreakdownStat key={row.label} label={row.label} pct={row.pct} color={c} delay={0.28 + i * 0.08} />;
            })}
          </div>

          <div style={{ height: 1, background: "#E5E3DC", marginBottom: 32 }} />

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.34, duration: 0.3 }}
          >
            <div className="flex items-center gap-6 mb-6" style={{ borderBottom: "1px solid #E5E3DC" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative pb-3.5 text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                  style={{ color: tab === t.id ? "#111111" : "#9B9890" }}>
                  {t.label}
                  {t.count !== undefined && (
                    <motion.span
                      layout
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: t.id === "formatting" && issues.length > 0 ? "rgba(225,29,72,0.10)" : "rgba(6,182,212,0.10)",
                        color:      t.id === "formatting" && issues.length > 0 ? "#e11d48"               : "#06b6d4",
                      }}>
                      {t.count}
                    </motion.span>
                  )}
                  {tab === t.id && (
                    <motion.div layoutId="tab-ul"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: "#111111" }}
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
                  <p className="text-[14px] leading-[1.9]" style={{ color: "#6B6860" }}>{feedback}</p>
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
                      <motion.span className="w-2 h-2 rounded-full" style={{ background: "#059669" }}
                        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: "#9B9890" }}>
                        Matched — {skills.length}
                      </span>
                    </div>
                    {skills.length > 0
                      ? <div className="flex flex-wrap gap-2">{skills.map((s, i) => <Chip key={i} label={s} variant="match" index={i} />)}</div>
                      : <p className="text-[13px]" style={{ color: "#9B9890" }}>No skills matched.</p>
                    }
                  </div>
                  <div style={{ height: 1, background: "#E5E3DC" }} />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <motion.span className="w-2 h-2 rounded-full" style={{ background: "#e11d48" }}
                        animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: "#9B9890" }}>
                        Missing — {missing.length}
                      </span>
                    </div>
                    {missing.length > 0
                      ? <div className="flex flex-wrap gap-2">{missing.map((k, i) => <Chip key={i} label={k} variant="missing" index={i} />)}</div>
                      : <p className="text-[13px]" style={{ color: "#9B9890" }}>Nothing missing — great coverage.</p>
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
                      className="flex gap-4 py-5"
                      style={{ borderBottom: i < issues.length - 1 ? "1px solid #E5E3DC" : "none" }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(225,29,72,0.1)" }}
                        animate={{ rotate: [0, -8, 8, 0] }}
                        transition={{ delay: i * 0.07 + 0.4, duration: 0.4 }}
                      >
                        <AlertCircle size={10} style={{ color: "#e11d48" }} />
                      </motion.div>
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-[0.12em] mb-1.5" style={{ color: "#e11d48" }}>Issue {i + 1}</p>
                        <p className="text-[13.5px] leading-relaxed" style={{ color: "#6B6860" }}>{iss}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="flex items-center gap-3 py-5">
                      <motion.div animate={{ rotate: [0, 10, -6, 0] }} transition={{ delay: 0.3, duration: 0.5 }}>
                        <CheckCircle2 size={20} style={{ color: "#059669" }} />
                      </motion.div>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: "#111111" }}>Formatting looks clean</p>
                        <p className="text-[12px] mt-0.5" style={{ color: "#9B9890" }}>Passed all ATS formatting checks.</p>
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
            whileHover={{ y: -3, boxShadow: "0 20px 48px rgba(6,182,212,0.22)" }}
            whileTap={{ scale: 0.98 }}
            className="group w-full mt-10 mb-6 rounded-2xl px-6 py-5 flex items-center justify-between text-left"
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              boxShadow: "0 6px 24px rgba(6,182,212,0.16)",
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <MessageSquare size={18} style={{ color: "#fff" }} />
              </motion.div>
              <div>
                <p className="text-[14px] font-bold text-white leading-tight">Chat with your resume</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.62)" }}>
                  Ask what to fix, rewrite sections, get it job-ready.
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.45)" }}
              className="shrink-0 group-hover:translate-x-1.5 transition-transform duration-200" />
          </motion.button>

          <div className="h-6" />
        </div>
      </div>

      <AnimatePresence>
        {aiViewOpen && <AiSplitView onClose={() => setAiViewOpen(false)} resume={resume} />}
      </AnimatePresence>
    </DashboardShell>
  );
}
