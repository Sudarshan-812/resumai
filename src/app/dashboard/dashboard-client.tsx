"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Plus, ChevronRight, UploadCloud, Mic, PenLine } from "lucide-react";
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
      <div className="min-h-full" style={{ background: "#F7F6F2" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9B9890" }}>
                {today}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#111111" }}>
                Good to see you, {userName}.
              </h1>
            </div>

            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white shrink-0"
                style={{ background: "#06b6d4" }}
              >
                <Plus size={15} strokeWidth={2.5} />
                New Analysis
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Metric strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: EASE }}
            className="grid grid-cols-3 mb-10 rounded-xl overflow-hidden"
            style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
          >
            {(
            [
              { label: "Analyses", value: totalScans.toString(), note: "total scans", valueColor: undefined, noteColor: undefined, action: undefined },
              {
                label: "Avg Score",
                value: avgScore > 0 ? `${avgScore}` : "—",
                note: avgScore >= 70 ? "above average" : avgScore > 0 ? "needs work" : "run a scan",
                valueColor: avgScore >= 70 ? "#059669" : avgScore > 0 ? "#d97706" : "#9B9890",
                noteColor: undefined,
                action: undefined,
              },
              {
                label: "Credits",
                value: credits.toString(),
                note: credits <= 1 ? "top up soon" : "remaining",
                valueColor: undefined,
                noteColor: credits <= 1 ? "#d97706" : undefined,
                action: (
                  <Link
                    href="/billing"
                    className="text-[10px] font-bold tracking-wide transition-colors"
                    style={{ color: "#06b6d4" }}
                  >
                    Top up →
                  </Link>
                ),
              },
            ] satisfies Array<{
              label: string;
              value: string;
              note: string;
              valueColor: string | undefined;
              noteColor: string | undefined;
              action: React.ReactNode;
            }>
          ).map((m, i) => (
              <div
                key={i}
                className="relative px-6 py-5"
                style={{ borderRight: i < 2 ? "1px solid #E5E3DC" : undefined }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>
                  {m.label}
                </p>
                <p
                  className="text-3xl font-bold tracking-tight tabular-nums leading-none mb-1.5"
                  style={{ color: m.valueColor ?? "#111111" }}
                >
                  {m.value}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px]" style={{ color: m.noteColor ?? "#9B9890" }}>
                    {m.note}
                  </p>
                  {m.action}
                </div>
              </div>
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
                <h2 className="text-[11px] font-mono uppercase tracking-[0.15em]" style={{ color: "#9B9890" }}>
                  Recent Analyses
                </h2>
                {recentResumes.length > 0 && (
                  <Link
                    href="/resumes"
                    className="group flex items-center gap-1 text-[11px] font-medium transition-colors"
                    style={{ color: "#9B9890" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9B9890")}
                  >
                    View all
                    <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {recentResumes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}>
                  {recentResumes.map((r, i) => {
                    const score = r.ats_score ?? 0;
                    const scoreColor =
                      score >= 75 ? "#059669"
                      : score >= 55 ? "#d97706"
                      : score > 0  ? "#e11d48"
                      : "#C8C4BB";

                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                        style={{ borderBottom: i < recentResumes.length - 1 ? "1px solid #E5E3DC" : undefined }}
                      >
                        <Link
                          href={`/dashboard/${r.id}`}
                          className="group flex items-center gap-4 px-5 py-4 transition-colors"
                          style={{ background: "transparent" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F7F6F2")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* File icon */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                          >
                            <FileText size={14} style={{ color: "#9B9890" }} strokeWidth={1.5} />
                          </div>

                          {/* Name + date */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate leading-none mb-1 transition-colors" style={{ color: "#111111" }} title={r.file_name}>
                              {r.file_name.replace(/\.pdf$/i, "")}
                            </p>
                            <p className="text-[11px] font-mono" style={{ color: "#C8C4BB" }}>
                              {fmt(r.created_at)}
                            </p>
                          </div>

                          {/* Score */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
                              {score > 0 ? score : "—"}
                              {score > 0 && <span className="text-[11px] font-normal ml-0.5" style={{ color: "#C8C4BB" }}>/100</span>}
                            </span>
                            <ArrowUpRight
                              size={13}
                              className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              style={{ color: "#C8C4BB" }}
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
              {/* AI Tools */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: "#9B9890" }}>
                  AI Tools
                </p>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}>
                  {[
                    { icon: PenLine, label: "Cover Letter", sub: "Role-specific in seconds", href: "/dashboard/cover-letter" },
                    { icon: Mic,     label: "Interview Prep", sub: "Practice with AI feedback", href: "/dashboard/interview" },
                  ].map(({ icon: Icon, label, sub, href }, i) => (
                    <Link
                      key={label}
                      href={href}
                      className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors"
                      style={{
                        background: "transparent",
                        borderBottom: i === 0 ? "1px solid #E5E3DC" : undefined,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F7F6F2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}
                      >
                        <Icon size={13} style={{ color: "#06b6d4" }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium leading-none mb-0.5" style={{ color: "#111111" }}>{label}</p>
                        <p className="text-[11px]" style={{ color: "#9B9890" }}>{sub}</p>
                      </div>
                      <ArrowUpRight
                        size={12}
                        className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                        style={{ color: "#C8C4BB" }}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upload CTA */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: "#9B9890" }}>
                  Quick Upload
                </p>
                <Link href="/upload">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative overflow-hidden rounded-xl p-5 cursor-pointer"
                    style={{ background: "#111111" }}
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
                      <UploadCloud size={18} style={{ color: "#06b6d4" }} strokeWidth={1.5} className="mb-3" />
                      <p className="text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>Analyze a resume</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Upload a PDF + job description for an instant ATS match report.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#06b6d4" }}>
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

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl py-16 flex flex-col items-center text-center"
      style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
      >
        <FileText size={18} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "#111111" }}>No analyses yet</p>
      <p className="text-[12px] mb-6 max-w-[200px] leading-relaxed" style={{ color: "#9B9890" }}>
        Upload your first resume to get your ATS score.
      </p>
      <Link href="/upload">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#06b6d4" }}
        >
          <UploadCloud size={13} strokeWidth={2} />
          Upload Resume
        </motion.button>
      </Link>
    </motion.div>
  );
}
