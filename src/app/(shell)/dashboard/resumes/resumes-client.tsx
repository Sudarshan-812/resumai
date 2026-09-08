"use client";

import Link from "next/link";
import {
  FileText, UploadSimple, ArrowUpRight, Plus,
  TrendUp as TrendingUp, TrendDown as TrendingDown,
} from "@phosphor-icons/react";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Array<{ ats_score?: number | null }> | null;
}

const scoreTone = (s: number) =>
  s >= 75 ? { text: "text-emerald-600", dot: "bg-emerald-500", label: "Strong" }
  : s >= 55 ? { text: "text-amber-600", dot: "bg-amber-500", label: "Fair" }
  : s > 0 ? { text: "text-rose-600", dot: "bg-rose-500", label: "Weak" }
  : { text: "text-muted-foreground", dot: "bg-muted-foreground/30", label: "-" };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[26px] font-semibold tabular-nums tracking-tight text-foreground leading-none">{value}</p>
      {hint != null && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResumeRow({ resume, prev }: { resume: Resume; prev?: Resume }) {
  const score = resume.analyses?.[0]?.ats_score ?? 0;
  const prevScore = prev?.analyses?.[0]?.ats_score ?? 0;
  const tone = scoreTone(score);
  const delta = prev && prevScore > 0 && score > 0 ? score - prevScore : null;

  return (
    <li className="border-b border-border last:border-0">
      <Link
        href={`/dashboard/${resume.id}`}
        className="group flex items-center gap-3 px-4 h-[56px] hover:bg-[#f8f8f9] transition-colors"
      >
        <span className="w-8 h-8 rounded-md border border-border flex items-center justify-center shrink-0">
          <FileText size={15} className="text-muted-foreground" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-medium text-foreground truncate leading-tight" title={resume.file_name}>
            {resume.file_name.replace(/\.pdf$/i, "")}
          </span>
          <span className="block text-[11.5px] text-muted-foreground leading-tight mt-0.5 tabular-nums">
            {fmtDate(resume.created_at)}
          </span>
        </span>
        {delta !== null && (
          <span
            className={`hidden sm:inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${
              delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-muted-foreground"
            }`}
          >
            {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : null}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
        <span className="w-14 shrink-0 flex items-center justify-end gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
          <span className={`text-[13px] font-semibold tabular-nums ${tone.text}`}>
            {score > 0 ? score : "-"}
          </span>
        </span>
        <ArrowUpRight
          size={14}
          className="shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        />
      </Link>
    </li>
  );
}

export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  const scores = resumes.map((r) => r.analyses?.[0]?.ats_score ?? 0).filter(Boolean);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const avgTone = scoreTone(avgScore);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Resumes</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Every resume you&apos;ve analysed, newest first.
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

      {resumes.length === 0 ? (
        <div className="rounded-lg border border-border flex flex-col items-center text-center px-6 py-16">
          <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-3">
            <FileText size={18} className="text-muted-foreground" />
          </div>
          <p className="text-[13px] font-medium text-foreground">No resumes yet</p>
          <p className="mt-1 text-[12px] text-muted-foreground max-w-[240px]">
            Upload your first resume and get an instant ATS score.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium text-white bg-primary hover:bg-[#0f9184] transition-colors"
          >
            <UploadSimple size={14} />
            Upload resume
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <StatTile label="Total resumes" value={resumes.length} hint="all time" />
            <StatTile
              label="Average score"
              value={avgScore > 0 ? <>{avgScore}<span className="text-[15px] font-normal text-muted-foreground">/100</span></> : "-"}
              hint={avgScore > 0
                ? <span className="inline-flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${avgTone.dot}`} />{avgTone.label}</span>
                : "no scored resumes"}
            />
            <StatTile
              label="Best score"
              value={bestScore > 0 ? <>{bestScore}<span className="text-[15px] font-normal text-muted-foreground">/100</span></> : "-"}
              hint={bestScore > 0 ? "top result" : "no data yet"}
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <ul>
              {resumes.map((r, i) => (
                <ResumeRow key={r.id} resume={r} prev={resumes[i + 1]} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
