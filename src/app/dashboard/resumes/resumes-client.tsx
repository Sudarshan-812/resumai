"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowUpRight, UploadCloud } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Array<{ ats_score?: number | null }> | null;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const fmt = (d: string) =>
    mounted ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const scoreColor = (s: number) =>
    s >= 75 ? "#059669" : s >= 55 ? "#d97706" : s > 0 ? "#e11d48" : "#C8C4BB";

  return (
    <DashboardShell>
      <div className="min-h-full" style={{ background: "#F7F6F2" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9B9890" }}>
                Resume Library
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#111111" }}>
                My Resumes
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9B9890" }}>
                {resumes.length} resume{resumes.length !== 1 ? "s" : ""} analyzed
              </p>
            </div>

            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white shrink-0"
                style={{ background: "#06b6d4" }}
              >
                <UploadCloud size={14} strokeWidth={2} />
                New Analysis
              </motion.button>
            </Link>
          </motion.div>

          {/* List */}
          {resumes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-xl"
              style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
              >
                <FileText size={18} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "#111111" }}>No resumes yet</p>
              <p className="text-[12px] mb-5 max-w-[200px] leading-relaxed" style={{ color: "#9B9890" }}>
                Upload your first resume to get an ATS score and AI feedback.
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
            >
              {resumes.map((r, i) => {
                const score = r.analyses?.[0]?.ats_score ?? 0;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                    style={{ borderBottom: i < resumes.length - 1 ? "1px solid #E5E3DC" : undefined }}
                  >
                    <Link
                      href={`/dashboard/${r.id}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors"
                      style={{ background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F7F6F2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                      >
                        <FileText size={14} style={{ color: "#9B9890" }} strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-none mb-1" style={{ color: "#111111" }} title={r.file_name}>
                          {r.file_name.replace(/\.pdf$/i, "")}
                        </p>
                        <p className="text-[11px] font-mono" style={{ color: "#C8C4BB" }}>
                          {fmt(r.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(score) }}>
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
            </motion.div>
          )}

        </div>
      </div>
    </DashboardShell>
  );
}
