"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronRight, Clock, UploadCloud } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Analysis = { ats_score?: number | null };
type ResumeItem = { id: string; file_name: string; created_at: string; analyses?: Analysis[] | null };

export default function ResumeList({ resumes }: { resumes: ResumeItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const formatDate = (ds: string) => {
    if (!mounted) return "—";
    return new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (!resumes || resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border bg-muted/10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
          <FileText size={24} className="text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">No resumes yet</p>
        <p className="text-[12px] text-muted-foreground mb-5 max-w-[220px] leading-relaxed">
          Upload your first resume to get an ATS score and AI-powered feedback.
        </p>
        <Link href="/upload">
          <Button className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
            <UploadCloud size={14} className="mr-1.5" />
            Analyze My Resume
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {resumes.map((resume, i) => {
        const score = resume.analyses?.[0]?.ats_score ?? 0;
        const scoreColor =
          score >= 75 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : score >= 55 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
          : score > 0  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
          : "bg-muted/50 text-muted-foreground border-border";

        const displayName = resume.file_name.replace(/\.pdf$/i, "");

        return (
          <Link
            key={resume.id}
            href={`/dashboard/${resume.id}`}
            className={cn(
              "flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group",
              i < resumes.length - 1 && "border-b border-border"
            )}
            prefetch={false}
          >
            <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-blue-600 group-hover:border-blue-500/30 transition-colors shrink-0">
              <FileText size={16} strokeWidth={1.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-semibold text-foreground truncate leading-none mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                title={displayName}
              >
                {displayName}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Clock size={10} />
                {formatDate(resume.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold border tabular-nums", scoreColor)}>
                {score > 0 ? `${score}/100` : "N/A"}
              </span>
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
