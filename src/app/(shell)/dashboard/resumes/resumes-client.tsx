"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CloudArrowUp as UploadCloud, ArrowRight, TrendUp as TrendingUp, TrendDown as TrendingDown, Minus } from "@phosphor-icons/react";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Array<{ ats_score?: number | null }> | null;
}

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

function scoreCfg(s: number) {
  if (s >= 75) return { color: "#059669", bg: "rgba(5,150,105,0.09)",  label: "Strong" };
  if (s >= 55) return { color: "#d97706", bg: "rgba(217,119,6,0.09)",  label: "Good"   };
  if (s  >  0) return { color: "#e11d48", bg: "rgba(225,29,72,0.09)",  label: "Weak"   };
  return             { color: "#b9bbc6", bg: "rgba(200,196,187,0.09)", label: "—"      };
}

function timeAgo(iso: string, mounted: boolean) {
  if (!mounted) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Mini score bar ─────────────────────────────────────────── */
function ScorePill({ score, index }: { score: number; index: number }) {
  const cfg = scoreCfg(score);
  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <motion.span
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.12 + index * 0.055, type: "spring", stiffness: 340, damping: 22 }}
        className="font-black font-mono tabular-nums leading-none"
        style={{ fontSize: 22, color: cfg.color, letterSpacing: "-0.04em" }}
      >
        {score > 0 ? score : "—"}
      </motion.span>
      {score > 0 && (
        <>
          <span className="text-[9px] font-mono" style={{ color: "#b9bbc6" }}>/100</span>
          <div className="w-12 h-0.5 rounded-full overflow-hidden" style={{ background: "#d9d9e0" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 + index * 0.055 }}
              style={{ background: cfg.color }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Application card ──────────────────────────────────────── */
function ResumeCard({ resume, index, prev }: { resume: Resume; index: number; prev?: Resume }) {
  const [hovered, setHovered] = useState(false);
  const score     = resume.analyses?.[0]?.ats_score ?? 0;
  const prevScore = prev?.analyses?.[0]?.ats_score ?? 0;
  const cfg       = scoreCfg(score);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const delta = prev && prevScore > 0 && score > 0 ? score - prevScore : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.065, type: "spring", stiffness: 260, damping: 24 }}
    >
      <Link
        href={`/dashboard/${resume.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block h-full"
      >
        <motion.div
          animate={{
            y: hovered ? -3 : 0,
            boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.02)",
            borderColor: hovered ? cfg.color + "55" : "#d9d9e0",
          }}
          transition={SPRING}
          className="flex flex-col h-full rounded-2xl overflow-hidden"
          style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}
        >
          {/* Top accent stripe, colored by score band */}
          <div className="h-[3px] shrink-0" style={{ background: cfg.color }} />

          <div className="flex-1 flex flex-col p-5">
            {/* Header row: icon + score pill */}
            <div className="flex items-start justify-between mb-4">
              <motion.div
                animate={{ background: hovered ? cfg.bg : "#f9f9fb", borderColor: hovered ? cfg.color + "44" : "#d9d9e0" }}
                transition={SPRING}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ border: "1px solid #d9d9e0" }}
              >
                <FileText size={17} style={{ color: hovered ? cfg.color : "#80838d" }} />
              </motion.div>
              <ScorePill score={score} index={index} />
            </div>

            {/* Title */}
            <p
              className="text-[14px] font-semibold leading-snug mb-2 line-clamp-2"
              style={{ color: "#1c2024" }}
              title={resume.file_name}
            >
              {resume.file_name.replace(/\.pdf$/i, "")}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-auto pt-3">
              <p className="text-[11px] font-mono" style={{ color: "#b9bbc6" }}>
                {timeAgo(resume.created_at, mounted)}
              </p>
              {delta !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.06, type: "spring", stiffness: 360, damping: 20 }}
                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={delta > 0
                    ? { background: "rgba(5,150,105,0.10)", color: "#059669" }
                    : { background: "rgba(225,29,72,0.10)", color: "#e11d48" }
                  }
                >
                  {delta > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  {delta > 0 ? "+" : ""}{delta}
                </motion.span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-3 text-[11px] font-semibold"
            style={{ borderTop: "1px solid #d9d9e0", color: cfg.color }}
          >
            View report
            <motion.div animate={{ x: hovered ? 3 : 0 }} transition={SPRING}>
              <ArrowRight size={13} />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const scores    = resumes.map(r => r.analyses?.[0]?.ats_score ?? 0).filter(Boolean);
  const avgScore  = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const cfg       = scoreCfg(avgScore);

  return (
      <div style={{ background: "#f9f9fb", minHeight: "100%" }}>
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-10"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-2.5" style={{ color: "#b9bbc6" }}>
                  Resume Library
                </p>
                <h1 className="font-display font-semibold tracking-tight" style={{ color: "#1c2024", fontSize: "clamp(24px, 5vw, 36px)", lineHeight: 1.15 }}>
                  My Resumes
                </h1>
              </div>

              <Link href="/upload">
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(18,165,148,0.28)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-[12px] font-bold text-white shrink-0 mt-1"
                  style={{ background: "linear-gradient(135deg,#12a594,#008573)", boxShadow: "0 4px 16px rgba(18,165,148,0.2)" }}
                >
                  <UploadCloud size={13} weight="bold" />
                  New scan
                </motion.button>
              </Link>
            </div>

            {/* Stats row */}
            {resumes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 24 }}
                className="flex items-center gap-2 flex-wrap"
              >
                {[
                  { label: "Scans",        val: resumes.length.toString(),  c: "#60646c" },
                  { label: "Avg score",    val: avgScore > 0 ? `${avgScore}` : "—",  c: cfg.color    },
                  { label: "Best",         val: bestScore > 0 ? `${bestScore}` : "—", c: "#12a594"  },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.14 + i * 0.07, type: "spring", stiffness: 320, damping: 22 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: "#FFFFFF", border: "1px solid #d9d9e0" }}
                  >
                    <span className="text-[10px]" style={{ color: "#80838d" }}>{s.label}</span>
                    <span className="text-[13px] font-black font-mono" style={{ color: s.c }}>{s.val}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* List */}
          <AnimatePresence mode="wait">
            {resumes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "#FFFFFF", border: "1px solid #d9d9e0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                >
                  <FileText size={22} style={{ color: "#b9bbc6" }} />
                </motion.div>
                <p className="text-[15px] font-semibold mb-1.5" style={{ color: "#1c2024" }}>No resumes yet</p>
                <p className="text-[13px] max-w-[200px] leading-relaxed mb-6" style={{ color: "#80838d" }}>
                  Upload your first resume and get an instant ATS score.
                </p>
                <Link href="/upload">
                  <motion.button
                    whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(18,165,148,0.28)" }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}
                    className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-[12px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#12a594,#008573)", boxShadow: "0 4px 16px rgba(18,165,148,0.18)" }}
                  >
                    <UploadCloud size={13} weight="bold" />
                    Upload Resume
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="list">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resumes.map((r, i) => (
                    <ResumeCard
                      key={r.id}
                      resume={r}
                      index={i}
                      prev={resumes[i + 1]}
                    />
                  ))}
                </div>

                {/* Bottom upload nudge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + resumes.length * 0.065 + 0.2 }}
                  className="pt-6 flex justify-center"
                >
                  <Link href="/upload">
                    <motion.button
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-4 py-2 rounded-xl"
                      style={{ border: "1px solid #d9d9e0", color: "#80838d", background: "#FFFFFF" }}
                    >
                      <UploadCloud size={11} />
                      Upload another
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
  );
}
