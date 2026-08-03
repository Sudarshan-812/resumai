"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CaretLeft as ChevronLeft, CaretRight as ChevronRight, ArrowUpRight, MagnifyingGlass as Search, CloudArrowUp as UploadCloud } from "@phosphor-icons/react";
import { AuroraBackground } from "@/components/dashboard/aurora-background";

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
    if (s >= 75) return { text: "text-emerald-600", bg: "bg-emerald-500/10", label: "Strong" };
    if (s >= 55) return { text: "text-amber-600",   bg: "bg-amber-500/10",   label: "Good" };
    if (s > 0)   return { text: "text-rose-600",     bg: "bg-rose-500/10",   label: "Weak" };
    return             { text: "text-muted-foreground", bg: "bg-muted", label: "-" };
  };

  return (
      <div className="min-h-full bg-background">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10 rounded-3xl overflow-hidden border border-border px-6 py-7"
          >
            <AuroraBackground className="opacity-60" />
            <div className="relative z-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5 text-muted-foreground">
                Scan History
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                All Analyses
              </h1>
              <p className="text-sm mt-1 text-muted-foreground">
                {totalCount} resume{totalCount !== 1 ? "s" : ""} analyzed in total
              </p>
            </div>

            <Link href="/upload" className="relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-primary shadow-lg shadow-primary/20 shrink-0"
              >
                <UploadCloud size={18} />
                New Analysis
              </motion.button>
            </Link>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: EASE }}
            className="relative mb-6 group"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename…"
              className="w-full h-11 rounded-xl pl-11 pr-4 text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40 transition-all"
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
                className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-muted border border-border">
                  <FileText size={24} className="text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium mb-1 text-foreground">
                  {query ? "No results found" : "No analyses yet"}
                </p>
                <p className="text-[12px] mb-5 text-muted-foreground">
                  {query ? `Nothing matches "${query}"` : "Upload your first resume to get started."}
                </p>
                {!query && (
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
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${page}-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl overflow-hidden border border-border bg-card"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 text-muted-foreground">
                          File
                        </th>
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right font-mono text-[10px] uppercase tracking-[0.12em] px-5 py-3 whitespace-nowrap text-muted-foreground">
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
                            className={`group cursor-pointer transition-colors hover:bg-muted/50 ${i < filtered.length - 1 ? "border-b border-border" : ""}`}
                            onClick={() => router.push(`/dashboard/${r.id}`)}
                          >
                            <td className="px-5 py-3.5 max-w-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-muted border border-border">
                                  <FileText size={16} className="text-muted-foreground" />
                                </div>
                                <span className="font-medium truncate text-foreground" title={r.file_name}>
                                  {r.file_name.replace(/\.pdf$/i, "")}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                              {fmt(r.created_at)}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className={`px-5 py-3.5 text-right whitespace-nowrap font-bold tabular-nums ${cfg.text}`}>
                              {r.ats_score > 0 ? r.ats_score : "-"}
                              {r.ats_score > 0 && (
                                <span className="text-[11px] font-normal ml-0.5 text-muted-foreground/60">/100</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <ArrowUpRight
                                size={16}
                                className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-muted-foreground/60"
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
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-border bg-card text-muted-foreground"
              >
                <ChevronLeft size={16} /> Previous
              </motion.button>

              <span className="text-[11px] font-mono text-muted-foreground">
                {page} / {totalPages}
              </span>

              <motion.button
                onClick={() => router.push(`/history?page=${page + 1}`)}
                disabled={page >= totalPages}
                whileHover={page < totalPages ? { x: 1 } : {}}
                whileTap={page < totalPages ? { scale: 0.97 } : {}}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-border bg-card text-muted-foreground"
              >
                Next <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

        </div>
      </div>
  );
}
