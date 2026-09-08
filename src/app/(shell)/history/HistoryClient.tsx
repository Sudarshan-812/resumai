"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, CaretLeft as ChevronLeft, CaretRight as ChevronRight,
  ArrowUpRight, MagnifyingGlass as Search, UploadSimple, Plus,
} from "@phosphor-icons/react";

interface Resume { id: string; file_name: string; created_at: string; ats_score: number }

interface Props {
  resumes: Resume[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const scoreTone = (s: number) =>
  s >= 75 ? { text: "text-emerald-600", dot: "bg-emerald-500", label: "Strong" }
  : s >= 55 ? { text: "text-amber-600", dot: "bg-amber-500", label: "Fair" }
  : s > 0 ? { text: "text-rose-600", dot: "bg-rose-500", label: "Weak" }
  : { text: "text-muted-foreground", dot: "bg-muted-foreground/30", label: "-" };

export default function HistoryClient({ resumes, totalCount, page, totalPages }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = resumes.filter((r) =>
    r.file_name.toLowerCase().includes(query.toLowerCase())
  );

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">History</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {totalCount} {totalCount === 1 ? "analysis" : "analyses"} run in total.
          </p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3 rounded-md text-[13px] font-medium text-white bg-primary hover:bg-[#0f9184] transition-colors"
        >
          <Plus size={14} weight="bold" />
          <span className="hidden sm:inline">New analysis</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename"
          className="w-full h-9 rounded-md pl-9 pr-3 text-[13px] bg-white border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border flex flex-col items-center text-center px-6 py-16">
          <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-3">
            <FileText size={18} className="text-muted-foreground" />
          </div>
          <p className="text-[13px] font-medium text-foreground">
            {query ? "No results" : "No analyses yet"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground max-w-[240px]">
            {query ? `Nothing matches "${query}".` : "Upload a resume and a job description to get your first score."}
          </p>
          {!query && (
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium text-white bg-primary hover:bg-[#0f9184] transition-colors"
            >
              <UploadSimple size={14} />
              Upload resume
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Column header */}
          <div className="hidden sm:flex items-center gap-3 px-4 h-10 border-b border-border bg-[#fbfbfc] text-[11px] font-medium text-muted-foreground">
            <span className="flex-1">File</span>
            <span className="w-28 shrink-0">Date</span>
            <span className="w-16 shrink-0 text-right">Score</span>
            <span className="w-4 shrink-0" />
          </div>

          <ul>
            {filtered.map((r) => {
              const tone = scoreTone(r.ats_score);
              return (
                <li key={r.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => router.push(`/dashboard/${r.id}`)}
                    className="group w-full flex items-center gap-3 px-4 h-[52px] text-left hover:bg-[#f8f8f9] transition-colors"
                  >
                    <FileText size={16} className="text-muted-foreground shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-foreground truncate leading-tight" title={r.file_name}>
                        {r.file_name.replace(/\.pdf$/i, "")}
                      </span>
                      <span className="block sm:hidden text-[11.5px] text-muted-foreground leading-tight mt-0.5">
                        {fmt(r.created_at)}
                      </span>
                    </span>
                    <span className="hidden sm:block w-28 shrink-0 text-[12.5px] text-muted-foreground tabular-nums">
                      {fmt(r.created_at)}
                    </span>
                    <span className="w-16 shrink-0 flex items-center justify-end gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                      <span className={`text-[13px] font-semibold tabular-nums ${tone.text}`}>
                        {r.ats_score > 0 ? r.ats_score : "-"}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="w-4 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !query && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => router.push(`/history?page=${page - 1}`)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="text-[12px] text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => router.push(`/history?page=${page + 1}`)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
