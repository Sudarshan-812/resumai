"use client";

import React, { useState, useEffect } from "react";
import { FileText, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Analysis = {
  ats_score?: number | null;
  summary_feedback?: string | null;
};

type ResumeItem = {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Analysis[] | null;
};

export default function ResumeList({ resumes }: { resumes: ResumeItem[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatSystemDate = (dateString: string) => {
    if (!mounted) return "00_AAA_0000";
    return new Date(dateString)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      .toUpperCase()
      .replace(/ /g, '_');
  };

  if (!resumes || resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
        <Activity className="w-8 h-8 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
        <p className="text-sm font-medium text-muted-foreground">No telemetry data detected.</p>
        <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mt-1">Status: Awaiting_First_Upload</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex flex-col">
        {resumes.map((resume) => {
          const analysis = (resume.analyses && resume.analyses[0]) || null;
          const score = typeof analysis?.ats_score === "number" ? analysis.ats_score : 0;

          return (
            <Link
              key={resume.id}
              href={`/dashboard/${resume.id}`}
              className="group flex items-center justify-between p-5 hover:bg-muted/50 border-b last:border-0 border-border transition-colors"
              prefetch={false}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                  <FileText className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground capitalize tracking-tight leading-none mb-1.5 group-hover:text-primary transition-colors">
                    {resume.file_name.replace('.pdf', '')}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                    Record_{resume.id.split('-')[0]} // {formatSystemDate(resume.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border transition-all",
                    score >= 70
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  )}>
                    ATS_{score.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-1 mr-0.5">
                    Metric
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full flex items-center justify-center border border-transparent group-hover:border-border group-hover:bg-background transition-all">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
