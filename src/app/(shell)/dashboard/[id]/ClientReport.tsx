"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiAssistant from "@/app/(shell)/dashboard/AiAssistant";
import LaTeXViewer from "./LaTeXViewer";
import {
  DownloadSimple as Download, X, CheckCircle as CheckCircle2, Copy,
  WarningCircle as AlertCircle, ArrowLeft, CaretRight as ChevronRight,
  ChatCircle as MessageSquare,
} from "@phosphor-icons/react";
import Link from "next/link";

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
  if (s >= 80) return { label: "Strong match", color: "#059669", tint: "bg-emerald-500/10", text: "text-emerald-600" };
  if (s >= 60) return { label: "Good match", color: "#d97706", tint: "bg-amber-500/10", text: "text-amber-600" };
  return { label: "Needs work", color: "#e11d48", tint: "bg-rose-500/10", text: "text-rose-600" };
}

/* ── Keyword chip ─────────────────────────────────────────────── */
function Chip({ label, variant }: { label: string; variant: "match" | "missing" }) {
  const clean = label.replace(/\[REQUIRED\]\s?|\[PREFERRED\]\s?/g, "");
  const isRequired = label.includes("[REQUIRED]");
  const cls =
    variant === "match"
      ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-700"
      : isRequired
      ? "border-rose-500/25 bg-rose-500/[0.06] text-rose-700"
      : "border-amber-500/25 bg-amber-500/[0.06] text-amber-700";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium border ${cls}`}>
      {variant === "match" ? <CheckCircle2 size={12} className="shrink-0" /> : <AlertCircle size={12} className="shrink-0" />}
      {clean}
    </span>
  );
}

/* ── Breakdown stat ───────────────────────────────────────────── */
function BreakdownStat({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 75 ? "#059669" : pct >= 50 ? "#d97706" : "#e11d48";
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[24px] font-semibold tabular-nums tracking-tight leading-none" style={{ color }}>
        {pct}<span className="text-[14px] font-normal text-muted-foreground">%</span>
      </p>
      <div className="mt-2.5 h-1 rounded-full overflow-hidden bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── AI split view (fullscreen) ───────────────────────────────── */
function AiSplitView({ onClose, resume }: { onClose: () => void; resume: ResumeData }) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [latexCode, setLatexCode] = useState("");
  const [isLatexLoading, setIsLatexLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resume-latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: resume.id }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.latex) setLatexCode(d.latex); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLatexLoading(false); });
    return () => { cancelled = true; };
  }, [resume.id]);

  const handleDownload = () => {
    const blob = new Blob([latexCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.file_name.replace(/\.[^.]+$/, "") + ".tex";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[150] flex flex-col bg-white"
    >
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
          <div>
            <p className="text-[13px] font-semibold leading-none text-foreground">Resume Copilot</p>
            <p className="text-[11px] mt-0.5 text-muted-foreground">Resume on the left, chat on the right</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAiLoading && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Thinking...
            </span>
          )}
          {latexCode && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] transition-colors"
            >
              <Download size={14} /><span className="hidden sm:inline">Download .tex</span>
            </button>
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

/* ── Main ─────────────────────────────────────────────────────── */
export default function ClientReport({
  resume, analysis, truncated = false,
}: {
  resume: ResumeData; analysis: AnalysisData; truncated?: boolean;
}) {
  const [tab, setTab] = useState<"summary" | "keywords" | "formatting">("summary");
  const [aiViewOpen, setAiViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [truncWarn, setTruncWarn] = useState(truncated);

  const score = analysis.ats_score ?? 0;
  const skills = analysis.skills_found ?? [];
  const missing = analysis.missing_keywords ?? [];
  const issues = analysis.formatting_issues ?? [];
  const feedback = analysis.summary_feedback ?? "";
  const yoe = analysis.calculated_yoe ?? 0;
  const fileName = resume.file_name.replace(/\.pdf$/i, "");
  const cfg = scoreCfg(score);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify({ fileName, analysis }, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [fileName, analysis]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify({ fileName, analysis }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileName, analysis]);

  const TABS: { id: "summary" | "keywords" | "formatting"; label: string; count?: number }[] = [
    { id: "summary", label: "Summary" },
    { id: "keywords", label: "Keywords", count: skills.length },
    { id: "formatting", label: "Formatting", count: issues.length || undefined },
  ];

  const breakdown = [
    { label: "Keyword match", pct: Math.round((skills.length / Math.max(skills.length + missing.length, 1)) * 100) },
    { label: "Experience", pct: Math.min(100, yoe > 0 ? 75 : 38) },
    { label: "Skills depth", pct: Math.min(100, skills.length > 5 ? 80 : skills.length * 13) },
    { label: "Formatting", pct: Math.max(0, 100 - issues.length * 15) },
  ];

  const statChips = [
    { label: "Experience", val: `${yoe} yrs`, dot: "bg-muted-foreground/40" },
    { label: "Matched", val: `${skills.length} skills`, dot: "bg-emerald-500" },
    { label: "Missing", val: `${missing.length} keywords`, dot: "bg-amber-500" },
    { label: "Formatting", val: issues.length === 0 ? "All good" : `${issues.length} issues`, dot: issues.length === 0 ? "bg-emerald-500" : "bg-rose-500" },
  ];

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 md:px-8 py-8">

        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> All reports
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] transition-colors"
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium border transition-colors ${
                copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9]"
              }`}
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Truncation warning */}
        {truncWarn && (
          <div className="flex items-start gap-3 rounded-md px-3.5 py-2.5 mb-6 text-[12.5px] bg-amber-500/[0.06] border border-amber-500/25 text-amber-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">Resume was too long - only the first 150,000 characters were analysed.</span>
            <button onClick={() => setTruncWarn(false)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Score hero */}
        <div className="rounded-lg border border-border p-5 mb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted-foreground mb-1.5">ATS report</p>
              <h1 className="text-[19px] font-semibold tracking-tight capitalize text-foreground leading-snug">
                {fileName}
              </h1>
              <p className="mt-2.5 text-[13px] leading-relaxed line-clamp-2 text-muted-foreground">{feedback}</p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-end gap-1 leading-none">
                <span className="text-[52px] font-semibold tabular-nums tracking-tight" style={{ color: cfg.color }}>
                  {score}
                </span>
                <span className="text-[13px] font-medium pb-1.5 text-muted-foreground">/100</span>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.tint} ${cfg.text}`}>
                {cfg.label}
              </span>
              <div className="w-24 h-1 rounded-full overflow-hidden bg-muted">
                <div className="h-full rounded-full" style={{ width: `${score}%`, background: cfg.color }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {statChips.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-[12px]">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium text-foreground">{s.val}</span>
            </span>
          ))}
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {breakdown.map((row) => (
            <BreakdownStat key={row.label} label={row.label} pct={row.pct} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-5 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative pb-3 text-[13px] font-medium transition-colors flex items-center gap-1.5"
              style={{ color: tab === t.id ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    t.id === "formatting" && issues.length > 0 ? "bg-rose-500/10 text-rose-600" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.count}
                </span>
              )}
              {tab === t.id && (
                <motion.div
                  layoutId="report-tab-underline"
                  className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 440, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[120px]">
          {tab === "summary" && (
            <p className="text-[13.5px] leading-[1.9] text-muted-foreground pb-2">{feedback}</p>
          )}

          {tab === "keywords" && (
            <div className="space-y-6 pb-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] font-medium text-muted-foreground">Matched - {skills.length}</span>
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">{skills.map((s, i) => <Chip key={i} label={s} variant="match" />)}</div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">No skills matched.</p>
                )}
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[12px] font-medium text-muted-foreground">Missing - {missing.length}</span>
                </div>
                {missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">{missing.map((k, i) => <Chip key={i} label={k} variant="missing" />)}</div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Nothing missing - great coverage.</p>
                )}
              </div>
            </div>
          )}

          {tab === "formatting" && (
            <div className="pb-2">
              {issues.length > 0 ? (
                <ul className="rounded-lg border border-border overflow-hidden">
                  {issues.map((iss, i) => (
                    <li key={i} className="flex gap-3 px-4 py-3.5 border-b border-border last:border-0">
                      <span className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={12} className="text-rose-600" />
                      </span>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{iss}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-4">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Formatting looks clean</p>
                    <p className="text-[12px] mt-0.5 text-muted-foreground">Passed all ATS formatting checks.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat CTA */}
        <button
          onClick={() => setAiViewOpen(true)}
          className="group w-full mt-8 rounded-lg border border-border hover:border-primary/40 hover:bg-[#f8f8f9] px-4 py-4 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-md bg-primary flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-white" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-foreground leading-tight">Chat with your resume</p>
              <p className="text-[12px] mt-0.5 text-muted-foreground">Ask what to fix, rewrite sections, get it job-ready.</p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {aiViewOpen && <AiSplitView onClose={() => setAiViewOpen(false)} resume={resume} />}
      </AnimatePresence>
    </>
  );
}
