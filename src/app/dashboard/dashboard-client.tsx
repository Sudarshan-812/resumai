"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Plus, CaretRight as ChevronRight, CloudArrowUp as UploadCloud, Microphone as Mic, PencilLine as PenLine, Scan as ScanLine, Target, Coins, TrendUp as TrendingUp, TrendDown as TrendingDown, DotsSixVertical as GripVertical } from "@phosphor-icons/react";
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

const EASE = [0.16, 1, 0.3, 1] as const;

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
    mounted ? new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <DashboardShell>
      <div className="min-h-full" style={{ background: "#f9f9fb" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#80838d" }}>
                {today}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#1c2024" }}>
                Good to see you, {userName}.
              </h1>
            </div>

            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white shrink-0"
                style={{ background: "#12a594" }}
              >
                <Plus size={15} weight="bold" />
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
                value: totalScans.toString(),
                diff: null,
                note: "total scans",
                valueColor: undefined,
                action: undefined,
              },
              {
                icon: Target,
                label: "Avg Score",
                value: avgScore > 0 ? `${avgScore}` : "—",
                diff: avgScore >= 70 ? "up" : avgScore > 0 ? "down" : null,
                note: avgScore >= 70 ? "above average" : avgScore > 0 ? "needs work" : "run a scan",
                valueColor: avgScore >= 70 ? "#059669" : avgScore > 0 ? "#d97706" : "#1c2024",
                action: undefined,
              },
              {
                icon: Coins,
                label: "Credits",
                value: credits.toString(),
                diff: credits <= 1 ? "down" : null,
                note: credits <= 1 ? "top up soon" : "remaining",
                valueColor: undefined,
                action: (
                  <Link
                    href="/billing"
                    className="text-[10px] font-bold tracking-wide transition-colors"
                    style={{ color: "#12a594" }}
                  >
                    Top up →
                  </Link>
                ),
              },
            ] satisfies Array<{
              icon: React.ElementType;
              label: string;
              value: string;
              diff: "up" | "down" | null;
              note: string;
              valueColor: string | undefined;
              action: React.ReactNode;
            }>
          ).map((m, i) => (
              <motion.div
                key={i}
                className="relative px-5 py-4 rounded-xl cursor-default"
                style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(18,165,148,0.08)", border: "1px solid rgba(18,165,148,0.15)" }}
                  >
                    <m.icon size={14} style={{ color: "#12a594" }} />
                  </div>
                  {m.diff && (
                    <span
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={m.diff === "up"
                        ? { background: "rgba(5,150,105,0.10)", color: "#059669" }
                        : { background: "rgba(217,119,6,0.10)", color: "#d97706" }
                      }
                    >
                      {m.diff === "up" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: "#80838d" }}>
                  {m.label}
                </p>
                <p
                  className="text-3xl font-bold tracking-tight tabular-nums leading-none mb-1.5"
                  style={{ color: m.valueColor ?? "#1c2024" }}
                >
                  {m.value}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px]" style={{ color: "#80838d" }}>
                    {m.note}
                  </p>
                  {m.action}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-10 items-start">

            {/* Left — Recent analyses */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.45, ease: EASE }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-mono uppercase tracking-[0.15em]" style={{ color: "#80838d" }}>
                  Recent Analyses
                </h2>
                {recentResumes.length > 0 && (
                  <Link
                    href="/resumes"
                    className="group flex items-center gap-1 text-[11px] font-medium transition-colors"
                    style={{ color: "#80838d" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#1c2024")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#80838d")}
                  >
                    View all
                    <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {recentResumes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}>
                  {recentResumes.map((r, i) => {
                    const score = r.ats_score ?? 0;
                    const scoreColor =
                      score >= 75 ? "#059669"
                      : score >= 55 ? "#d97706"
                      : score > 0  ? "#e11d48"
                      : "#b9bbc6";

                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                        style={{ borderBottom: i < recentResumes.length - 1 ? "1px solid #d9d9e0" : undefined }}
                      >
                        <Link
                          href={`/dashboard/${r.id}`}
                          className="group flex items-center gap-4 px-5 py-4 transition-colors"
                          style={{ background: "transparent" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f9f9fb")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* File icon */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ background: "#f9f9fb", border: "1px solid #d9d9e0" }}
                          >
                            <FileText size={14} style={{ color: "#80838d" }} />
                          </div>

                          {/* Name + date */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate leading-none mb-1 transition-colors" style={{ color: "#1c2024" }} title={r.file_name}>
                              {r.file_name.replace(/\.pdf$/i, "")}
                            </p>
                            <p className="text-[11px] font-mono" style={{ color: "#b9bbc6" }}>
                              {fmt(r.created_at)}
                            </p>
                          </div>

                          {/* Score */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
                              {score > 0 ? score : "—"}
                              {score > 0 && <span className="text-[11px] font-normal ml-0.5" style={{ color: "#b9bbc6" }}>/100</span>}
                            </span>
                            <ArrowUpRight
                              size={13}
                              className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              style={{ color: "#b9bbc6" }}
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Right — sidebar panel */}
            <motion.aside
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.45, ease: EASE }}
              className="space-y-6"
            >
              <AiToolsPanel />

              {/* Upload CTA */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: "#80838d" }}>
                  Quick Upload
                </p>
                <Link href="/upload">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative overflow-hidden rounded-xl p-5 cursor-pointer"
                    style={{ background: "#1c2024" }}
                  >
                    {/* subtle grid texture */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="relative">
                      <UploadCloud size={18} style={{ color: "#12a594" }} className="mb-3" />
                      <p className="text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>Analyze a resume</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Upload a PDF + job description for an instant ATS match report.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#12a594" }}>
                        Upload PDF <ArrowUpRight size={11} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </DashboardShell>
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
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: "#80838d" }}>
        AI Tools
      </p>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}>
        {items.map(({ key, icon: Icon, label, sub, href }, i) => (
          <div
            key={key}
            onDragOver={e => { e.preventDefault(); if (dragKey && dragKey !== key) setOverKey(key); }}
            onDragLeave={() => setOverKey(prev => (prev === key ? null : prev))}
            onDrop={() => handleDrop(key)}
            className="group flex items-center gap-2 pl-2 pr-4 py-3.5 transition-colors"
            style={{
              background: overKey === key ? "#f0f0f3" : "transparent",
              borderBottom: i < items.length - 1 ? "1px solid #d9d9e0" : undefined,
              opacity: dragKey === key ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!dragKey) e.currentTarget.style.background = "#f9f9fb"; }}
            onMouseLeave={e => { if (!dragKey) e.currentTarget.style.background = "transparent"; }}
          >
            <span
              draggable
              onDragStart={() => setDragKey(key)}
              onDragEnd={() => { setDragKey(null); setOverKey(null); }}
              className="shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1 touch-none"
              aria-label={`Drag to reorder ${label}`}
            >
              <GripVertical size={13} style={{ color: "#d9d9e0" }} />
            </span>
            <Link href={href} className="group/link flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(18,165,148,0.08)", border: "1px solid rgba(18,165,148,0.15)" }}
              >
                <Icon size={13} style={{ color: "#12a594" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-none mb-0.5" style={{ color: "#1c2024" }}>{label}</p>
                <p className="text-[11px]" style={{ color: "#80838d" }}>{sub}</p>
              </div>
              <ArrowUpRight
                size={12}
                className="transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 shrink-0"
                style={{ color: "#b9bbc6" }}
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
      className="rounded-xl py-16 flex flex-col items-center text-center"
      style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "#f9f9fb", border: "1px solid #d9d9e0" }}
      >
        <FileText size={18} style={{ color: "#b9bbc6" }} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "#1c2024" }}>No analyses yet</p>
      <p className="text-[12px] mb-6 max-w-[200px] leading-relaxed" style={{ color: "#80838d" }}>
        Upload your first resume to get your ATS score.
      </p>
      <Link href="/upload">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#12a594" }}
        >
          <UploadCloud size={13} />
          Upload Resume
        </motion.button>
      </Link>
    </motion.div>
  );
}
