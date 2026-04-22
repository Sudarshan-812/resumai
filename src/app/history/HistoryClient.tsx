"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardShell from "@/app/dashboard/DashboardShell";

interface Resume { id: string; file_name: string; created_at: string; ats_score: number }

interface Props {
  resumes: Resume[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export default function HistoryClient({ resumes, totalCount, page, totalPages }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = resumes.filter(r =>
    r.file_name.toLowerCase().includes(query.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <DashboardShell>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">All Analyses</h1>
          <p className="text-muted-foreground text-sm">
            {totalCount} resume{totalCount !== 1 ? "s" : ""} analyzed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full h-11 rounded-xl border border-border bg-muted/30 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-24 text-center"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
              >
                <FileText className="mx-auto h-10 w-10 text-muted/30 mb-4" strokeWidth={1} />
              </motion.div>
              <p className="text-sm text-muted-foreground">
                {query ? "No results match your search." : "No analyses yet. Upload your first resume!"}
              </p>
              {!query && (
                <Link href="/upload" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
                  Start a Scan →
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`list-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
            >
              {filtered.map((resume, i) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.35, ease: "easeOut" }}
                  whileHover={{ x: 3 }}
                  className="border-b last:border-0 border-border"
                >
                  <Link
                    href={`/dashboard/${resume.id}`}
                    className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                        <FileText className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[240px]" title={resume.file_name.replace(/\.pdf$/i, "")}>
                          {resume.file_name.replace(/\.pdf$/i, "")}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {formatDate(resume.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border",
                        resume.ats_score >= 70
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : resume.ats_score >= 50
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}>
                        ATS_{resume.ats_score}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
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
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-6"
          >
            <motion.button
              onClick={() => router.push(`/history?page=${page - 1}`)}
              disabled={page <= 1}
              whileHover={page > 1 ? { x: -2 } : {}}
              whileTap={page > 1 ? { scale: 0.96 } : {}}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </motion.button>

            <span className="text-xs text-muted-foreground font-mono">
              Page {page} of {totalPages}
            </span>

            <motion.button
              onClick={() => router.push(`/history?page=${page + 1}`)}
              disabled={page >= totalPages}
              whileHover={page < totalPages ? { x: 2 } : {}}
              whileTap={page < totalPages ? { scale: 0.96 } : {}}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </main>
    </DashboardShell>
  );
}
