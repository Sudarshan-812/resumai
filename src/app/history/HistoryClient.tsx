"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import NavbarWrapper from "@/app/dashboard/NavbarWrapper";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  ats_score: number;
}

export default function HistoryClient({ resumes }: { resumes: Resume[] }) {
  const [query, setQuery] = useState("");

  const filtered = resumes.filter((r) =>
    r.file_name.toLowerCase().includes(query.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavbarWrapper />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight mb-2">
            All Analyses
          </h1>
          <p className="text-muted-foreground text-sm">
            {resumes.length} scan{resumes.length !== 1 ? "s" : ""} in your pipeline
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full h-11 rounded-xl border border-border bg-muted/30 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </motion.div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted/30 mb-4" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {query ? "No results match your search." : "No analyses yet. Upload your first resume!"}
            </p>
            {!query && (
              <Link href="/upload" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
                Start a Scan →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            {filtered.map((resume, i) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35, ease: "easeOut" }}
              >
                <Link
                  href={`/dashboard/${resume.id}`}
                  className="flex items-center justify-between p-5 hover:bg-muted/40 border-b last:border-0 border-border transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                      <FileText className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize tracking-tight">
                        {resume.file_name.replace(".pdf", "")}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {formatDate(resume.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border",
                        resume.ats_score >= 70
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : resume.ats_score >= 50
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}
                    >
                      ATS_{resume.ats_score}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
