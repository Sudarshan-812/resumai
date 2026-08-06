"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Plus, CaretRight as ChevronRight, CloudArrowUp as UploadCloud, Microphone as Mic, PencilLine as PenLine, Scan as ScanLine, Target, Coins, TrendUp as TrendingUp, TrendDown as TrendingDown, DotsSixVertical as GripVertical } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/dashboard/spotlight-card";
import { BorderBeam } from "@/components/dashboard/border-beam";
import { NumberTicker } from "@/components/dashboard/number-ticker";
import { AuroraBackground } from "@/components/dashboard/aurora-background";

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

const EASE = [0.16, 1, 0.3, 1] as const;

function AvgScoreRing({ score }: { score: number }) {
  const hasData = score > 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => {
      setDashOffset(circumference - (score / 100) * circumference);
    }, 150);
    return () => clearTimeout(t);
  }, [score, circumference]);

  const colorClass = !hasData
    ? "text-muted-foreground/30"
    : score >= 70 ? "text-emerald-500"
    : score >= 50 ? "text-amber-500"
    : "text-rose-500";

  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/60" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={colorClass}
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-lg font-bold tabular-nums leading-none ${hasData ? "text-foreground" : "text-muted-foreground/40"}`}>
          {hasData ? score : "–"}
        </span>
        <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">avg</span>
      </div>
    </div>
  );
}

const AI_TOOLS = [
  { key: "cover-letter", icon: PenLine, label: "Cover Letter", sub: "Role-specific in seconds", href: "/dashboard/cover-letter" },
  { key: "interview", icon: Mic, label: "Interview Prep", sub: "Practice with AI feedback", href: "/dashboard/interview" },
] as const;

const AI_TOOLS_ORDER_KEY = "c8-ai-tools-order";

export default function DashboardClient({ user, profile, recentResumes, stats }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const userName  = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const credits   = profile?.credits ?? 0;
  const { totalScans, avgScore } = stats;

  const today = mounted
    ? new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  const fmt = (ds: string) =>
    mounted ? new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 rounded-3xl overflow-hidden px-6 py-8 border border-border"
        >
          <AuroraBackground className="opacity-70" />
          <div className="relative z-10 flex items-center gap-5">
            <AvgScoreRing score={avgScore} />
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] mb-1.5 text-muted-foreground">
                {today}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Good to see you, {userName}.
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalScans > 0
                  ? `Averaging ${avgScore}/100 across ${totalScans} scan${totalScans === 1 ? "" : "s"}.`
                  : "Run your first scan to see your ATS score here."}
              </p>
            </div>
          </div>

          <Link href="/upload" className="relative z-10 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-primary shadow-lg shadow-primary/20 shrink-0"
            >
              <Plus size={18} weight="bold" />
              New Analysis
            </motion.button>
          </Link>
        </motion.div>

        {/* ── Stats grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {(
          [
            {
              icon: ScanLine,
              label: "Analyses",
              value: totalScans,
              suffix: "",
              diff: null,
              note: "total scans",
              valueColor: "text-foreground",
              action: undefined,
            },
            {
              icon: Target,
              label: "Avg Score",
              value: avgScore,
              suffix: avgScore > 0 ? " /100" : "",
              diff: avgScore >= 70 ? "up" : avgScore > 0 ? "down" : null,
              note: avgScore >= 70 ? "above average" : avgScore > 0 ? "needs work" : "run a scan",
              valueColor: avgScore >= 70 ? "text-emerald-600" : avgScore > 0 ? "text-amber-600" : "text-foreground",
              action: undefined,
            },
            {
              icon: Coins,
              label: "Credits",
              value: credits,
              suffix: "",
              diff: credits <= 1 ? "down" : null,
              note: credits <= 1 ? "top up soon" : "remaining",
              valueColor: "text-foreground",
              action: (
                <Link href="/billing" className="text-[10px] font-bold tracking-wide text-primary transition-colors">
                  Top up →
                </Link>
              ),
            },
          ] satisfies Array<{
            icon: React.ElementType;
            label: string;
            value: number;
            suffix: string;
            diff: "up" | "down" | null;
            note: string;
            valueColor: string;
            action: React.ReactNode;
          }>
        ).map((m, i) => (
            <SpotlightCard key={i} className="px-5 py-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/15">
                  <m.icon size={23} className="text-primary" />
                </div>
                {m.diff && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      m.diff === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {m.diff === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 text-muted-foreground">
                {m.label}
              </p>
              <p className={`text-4xl font-bold tracking-tight tabular-nums leading-none mb-2 ${m.valueColor}`}>
                <NumberTicker value={m.value} />
                {m.suffix && <span className="text-base font-semibold text-muted-foreground/60">{m.suffix}</span>}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{m.note}</p>
                {m.action}
              </div>
            </SpotlightCard>
          ))}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-10 items-start">

          {/* Left - Recent analyses */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Recent Analyses
              </h2>
              {recentResumes.length > 0 && (
                <Link
                  href="/resumes"
                  className="group flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {recentResumes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="rounded-2xl overflow-hidden border border-border bg-card">
                {recentResumes.map((r, i) => {
                  const score = r.ats_score ?? 0;
                  const scoreColor =
                    score >= 75 ? "text-emerald-600"
                    : score >= 55 ? "text-amber-600"
                    : score > 0  ? "text-rose-600"
                    : "text-muted-foreground/50";

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                      className={i < recentResumes.length - 1 ? "border-b border-border" : undefined}
                    >
                      <Link
                        href={`/dashboard/${r.id}`}
                        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                      >
                        {/* File icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted border border-border">
                          <FileText size={18} className="text-muted-foreground" />
                        </div>

                        {/* Name + date */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate leading-none mb-1 text-foreground" title={r.file_name}>
                            {r.file_name.replace(/\.pdf$/i, "")}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground/70">
                            {fmt(r.created_at)}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
                            {score > 0 ? score : "-"}
                            {score > 0 && <span className="text-[11px] font-normal ml-0.5 text-muted-foreground/70">/100</span>}
                          </span>
                          <ArrowUpRight
                            size={16}
                            className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-muted-foreground/70"
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right - sidebar panel */}
          <motion.aside
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.45, ease: EASE }}
            className="space-y-6"
          >
            <AiToolsPanel />

            {/* Upload CTA */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3 text-muted-foreground">
                Quick Upload
              </p>
              <Link href="/upload">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative overflow-hidden rounded-2xl p-5 cursor-pointer bg-foreground"
                >
                  <BorderBeam />
                  {/* subtle grid texture */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative">
                    <UploadCloud size={26} className="text-primary mb-3" />
                    <p className="text-sm font-semibold mb-1 text-white">Analyze a resume</p>
                    <p className="text-[11px] leading-relaxed text-white/45">
                      Upload a PDF + job description for an instant ATS match report.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                      Upload PDF <ArrowUpRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function AiToolsPanel() {
  const [order, setOrder] = useState<string[]>(AI_TOOLS.map(t => t.key));
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(AI_TOOLS_ORDER_KEY);
    if (!saved) return;
    try {
      const parsed: string[] = JSON.parse(saved);
      const valid = parsed.length === AI_TOOLS.length && parsed.every(k => AI_TOOLS.some(t => t.key === k));
      if (valid) setOrder(parsed);
    } catch {
      // ignore malformed local storage value
    }
  }, []);

  const items = order.map(key => AI_TOOLS.find(t => t.key === key)!).filter(Boolean);

  const handleDrop = (targetKey: string) => {
    setOverKey(null);
    if (!dragKey || dragKey === targetKey) { setDragKey(null); return; }
    setOrder(prev => {
      const next = [...prev];
      next.splice(next.indexOf(dragKey), 1);
      next.splice(next.indexOf(targetKey), 0, dragKey);
      localStorage.setItem(AI_TOOLS_ORDER_KEY, JSON.stringify(next));
      return next;
    });
    setDragKey(null);
  };

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3 text-muted-foreground">
        AI Tools
      </p>
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        {items.map(({ key, icon: Icon, label, sub, href }, i) => (
          <div
            key={key}
            onDragOver={e => { e.preventDefault(); if (dragKey && dragKey !== key) setOverKey(key); }}
            onDragLeave={() => setOverKey(prev => (prev === key ? null : prev))}
            onDrop={() => handleDrop(key)}
            className={`group flex items-center gap-2 pl-2 pr-4 py-3.5 transition-colors ${
              overKey === key ? "bg-muted" : "hover:bg-muted/50"
            } ${i < items.length - 1 ? "border-b border-border" : ""}`}
            style={{ opacity: dragKey === key ? 0.5 : 1 }}
          >
            <span
              draggable
              onDragStart={() => setDragKey(key)}
              onDragEnd={() => { setDragKey(null); setOverKey(null); }}
              className="shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
              aria-label={`Drag to reorder ${label}`}
            >
              <GripVertical size={16} className="text-border" />
            </span>
            <Link href={href} className="group/link flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/15">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-none mb-0.5 text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
              <ArrowUpRight
                size={14}
                className="transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 shrink-0 text-muted-foreground/70"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl py-16 flex flex-col items-center text-center overflow-hidden border border-border bg-card"
    >
      <AuroraBackground className="opacity-50" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-muted border border-border">
          <FileText size={24} className="text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium mb-1 text-foreground">No analyses yet</p>
        <p className="text-[12px] mb-6 max-w-[200px] leading-relaxed text-muted-foreground">
          Upload your first resume to get your ATS score.
        </p>
        <Link href="/upload">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold text-white bg-primary"
          >
            <UploadCloud size={16} />
            Upload Resume
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
