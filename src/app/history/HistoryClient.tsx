"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight, ArrowUpRight, Search, UploadCloud } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";

interface Resume { id: string; file_name: string; created_at: string; ats_score: number }

interface Props {
  resumes: Resume[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HistoryClient({ resumes, totalCount, page, totalPages }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = resumes.filter(r =>
    r.file_name.toLowerCase().includes(query.toLowerCase())
  );

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

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
                Scan History
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#111111" }}>
                All Analyses
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9B9890" }}>
                {totalCount} resume{totalCount !== 1 ? "s" : ""} analyzed in total
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

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: EASE }}
            className="relative mb-6"
          >
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C8C4BB" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="w-full h-10 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 transition-all"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E3DC",
                color: "#111111",
              }}
            />
          </motion.div>

          {/* List */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-xl"
                style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                >
                  <FileText size={18} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "#111111" }}>
                  {query ? "No results found" : "No analyses yet"}
                </p>
                <p className="text-[12px] mb-5" style={{ color: "#9B9890" }}>
                  {query ? `Nothing matches "${query}"` : "Upload your first resume to get started."}
                </p>
                {!query && (
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
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${page}-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #E5E3DC", background: "#FFFFFF" }}
              >
                {filtered.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ x: 3 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #E5E3DC" : undefined }}
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
                        <p
                          className="text-sm font-medium truncate leading-none mb-1"
                          style={{ color: "#111111" }}
                          title={r.file_name}
                        >
                          {r.file_name.replace(/\.pdf$/i, "")}
                        </p>
                        <p className="text-[11px] font-mono" style={{ color: "#C8C4BB" }}>
                          {fmt(r.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(r.ats_score) }}>
                          {r.ats_score > 0 ? r.ats_score : "—"}
                          {r.ats_score > 0 && (
                            <span className="text-[11px] font-normal ml-0.5" style={{ color: "#C8C4BB" }}>/100</span>
                          )}
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: "#C8C4BB" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && !query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-between mt-6"
            >
              <motion.button
                onClick={() => router.push(`/history?page=${page - 1}`)}
                disabled={page <= 1}
                whileHover={page > 1 ? { x: -1 } : {}}
                whileTap={page > 1 ? { scale: 0.97 } : {}}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: "1px solid #E5E3DC", background: "#FFFFFF", color: "#6B6860" }}
              >
                <ChevronLeft size={14} /> Previous
              </motion.button>

              <span className="text-[11px] font-mono" style={{ color: "#9B9890" }}>
                {page} / {totalPages}
              </span>

              <motion.button
                onClick={() => router.push(`/history?page=${page + 1}`)}
                disabled={page >= totalPages}
                whileHover={page < totalPages ? { x: 1 } : {}}
                whileTap={page < totalPages ? { scale: 0.97 } : {}}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: "1px solid #E5E3DC", background: "#FFFFFF", color: "#6B6860" }}
              >
                Next <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          )}

        </div>
      </div>
    </DashboardShell>
  );
}
