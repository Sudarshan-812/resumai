"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CaretLeft as ChevronLeft, CaretRight as ChevronRight, ArrowUpRight, MagnifyingGlass as Search, CloudArrowUp as UploadCloud } from "@phosphor-icons/react";

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

  const scoreCfg = (s: number) => {
    if (s >= 75) return { color: "#059669", bg: "rgba(5,150,105,0.09)", label: "Strong" };
    if (s >= 55) return { color: "#d97706", bg: "rgba(217,119,6,0.09)", label: "Good" };
    if (s > 0)   return { color: "#e11d48", bg: "rgba(225,29,72,0.09)", label: "Weak" };
    return             { color: "#b9bbc6", bg: "rgba(200,196,187,0.09)", label: "—" };
  };

  return (
      <div className="min-h-full" style={{ background: "#f9f9fb" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#80838d" }}>
                Scan History
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#1c2024" }}>
                All Analyses
              </h1>
              <p className="text-sm mt-1" style={{ color: "#80838d" }}>
                {totalCount} resume{totalCount !== 1 ? "s" : ""} analyzed in total
              </p>
            </div>

            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white shrink-0"
                style={{ background: "#12a594" }}
              >
                <UploadCloud size={14} />
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
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#b9bbc6" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="w-full h-10 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#12a594]/30 transition-all"
              style={{
                background: "#FFFFFF",
                border: "1px solid #d9d9e0",
                color: "#1c2024",
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
                style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#f9f9fb", border: "1px solid #d9d9e0" }}
                >
                  <FileText size={18} style={{ color: "#b9bbc6" }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "#1c2024" }}>
                  {query ? "No results found" : "No analyses yet"}
                </p>
                <p className="text-[12px] mb-5" style={{ color: "#80838d" }}>
                  {query ? `Nothing matches "${query}"` : "Upload your first resume to get started."}
                </p>
                {!query && (
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
                style={{ border: "1px solid #d9d9e0", background: "#FFFFFF" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #d9d9e0" }}>
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3" style={{ color: "#80838d" }}>
                          File
                        </th>
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap" style={{ color: "#80838d" }}>
                          Date
                        </th>
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap" style={{ color: "#80838d" }}>
                          Status
                        </th>
                        <th className="text-right font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap" style={{ color: "#80838d" }}>
                          Score
                        </th>
                        <th className="px-5 py-3 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => {
                        const cfg = scoreCfg(r.ats_score);
                        return (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03, duration: 0.3 }}
                            className="group cursor-pointer transition-colors"
                            style={{ borderBottom: i < filtered.length - 1 ? "1px solid #d9d9e0" : undefined }}
                            onClick={() => router.push(`/dashboard/${r.id}`)}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f9f9fb")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="px-5 py-3.5 max-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: "#f9f9fb", border: "1px solid #d9d9e0" }}
                                >
                                  <FileText size={14} style={{ color: "#80838d" }} />
                                </div>
                                <span
                                  className="font-medium truncate"
                                  style={{ color: "#1c2024" }}
                                  title={r.file_name}
                                >
                                  {r.file_name.replace(/\.pdf$/i, "")}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[12px] whitespace-nowrap" style={{ color: "#80838d" }}>
                              {fmt(r.created_at)}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span
                                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: cfg.bg, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <span className="font-bold tabular-nums" style={{ color: cfg.color }}>
                                {r.ats_score > 0 ? r.ats_score : "—"}
                                {r.ats_score > 0 && (
                                  <span className="text-[11px] font-normal ml-0.5" style={{ color: "#b9bbc6" }}>/100</span>
                                )}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <ArrowUpRight
                                size={13}
                                className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                style={{ color: "#b9bbc6" }}
                              />
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                style={{ border: "1px solid #d9d9e0", background: "#FFFFFF", color: "#60646c" }}
              >
                <ChevronLeft size={14} /> Previous
              </motion.button>

              <span className="text-[11px] font-mono" style={{ color: "#80838d" }}>
                {page} / {totalPages}
              </span>

              <motion.button
                onClick={() => router.push(`/history?page=${page + 1}`)}
                disabled={page >= totalPages}
                whileHover={page < totalPages ? { x: 1 } : {}}
                whileTap={page < totalPages ? { scale: 0.97 } : {}}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: "1px solid #d9d9e0", background: "#FFFFFF", color: "#60646c" }}
              >
                Next <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          )}

        </div>
      </div>
  );
}
