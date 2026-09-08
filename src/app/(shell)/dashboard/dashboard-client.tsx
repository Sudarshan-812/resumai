"use client";

import Link from "next/link";
import {
  FileText, ArrowRight, ArrowUpRight, Microphone, PencilLine, UploadSimple,
} from "@phosphor-icons/react";

interface DashboardClientProps {
  user: { email?: string; user_metadata?: { avatar_url?: string; picture?: string } };
  profile: { full_name?: string | null; credits?: number | null } | null;
  recentResumes: Array<{
    id: string;
    file_name: string;
    created_at: string;
    dateLabel: string;
    ats_score?: number | null;
  }>;
  stats: { totalScans: number; avgScore: number };
}

const scoreTone = (s: number) =>
  s >= 75 ? { text: "text-emerald-600", dot: "bg-emerald-500", label: "Strong" }
  : s >= 55 ? { text: "text-amber-600", dot: "bg-amber-500", label: "Fair" }
  : s > 0 ? { text: "text-rose-600", dot: "bg-rose-500", label: "Weak" }
  : { text: "text-muted-foreground", dot: "bg-muted-foreground/30", label: "—" };

function StatTile({ label, value, hint, hintClass = "text-muted-foreground" }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; hintClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[26px] font-semibold tabular-nums tracking-tight text-foreground leading-none">
        {value}
      </p>
      {hint != null && <p className={`mt-2 text-[12px] ${hintClass}`}>{hint}</p>}
    </div>
  );
}

const TOOLS = [
  { label: "Mock Interview", sub: "Voice or text · free", href: "/dashboard/interview", icon: Microphone },
  { label: "Cover Letter", sub: "Tailored to the job", href: "/dashboard/cover-letter", icon: PencilLine },
  { label: "Upload resume", sub: "Run a new analysis", href: "/upload", icon: UploadSimple },
];

export default function DashboardClient({ user, profile, recentResumes, stats }: DashboardClientProps) {
  const userName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const credits = profile?.credits ?? 0;
  const { totalScans, avgScore } = stats;
  const bestScore = recentResumes.reduce((m, r) => Math.max(m, r.ats_score ?? 0), 0);
  const avgTone = scoreTone(avgScore);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          {totalScans > 0 ? `Welcome back, ${userName}` : `Welcome, ${userName}`}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {totalScans > 0
            ? `You've run ${totalScans} ${totalScans === 1 ? "analysis" : "analyses"}. Here's where things stand.`
            : "Upload a resume and a job description to get your first ATS match score."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatTile label="Analyses run" value={totalScans} hint="all time" />
        <StatTile
          label="Average score"
          value={avgScore > 0 ? <>{avgScore}<span className="text-[15px] font-normal text-muted-foreground">/100</span></> : "—"}
          hint={avgScore > 0
            ? <span className="inline-flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${avgTone.dot}`} />{avgTone.label}</span>
            : "no data yet"}
        />
        <StatTile
          label="Best score"
          value={bestScore > 0 ? <>{bestScore}<span className="text-[15px] font-normal text-muted-foreground">/100</span></> : "—"}
          hint={bestScore > 0 ? "top result" : "no data yet"}
        />
        <StatTile
          label="Credits"
          value={credits}
          hint={credits <= 1
            ? <Link href="/billing" className="text-primary hover:underline font-medium">Add credits →</Link>
            : "remaining"}
          hintClass={credits <= 1 ? "" : "text-muted-foreground"}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">

        {/* Recent analyses */}
        <section className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border">
            <h2 className="text-[13px] font-medium text-foreground">Recent analyses</h2>
            {recentResumes.length > 0 && (
              <Link href="/history" className="group inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                View all
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {recentResumes.length === 0 ? (
            <div className="flex flex-col items-center text-center px-6 py-14">
              <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-3">
                <FileText size={18} className="text-muted-foreground" />
              </div>
              <p className="text-[13px] font-medium text-foreground">No analyses yet</p>
              <p className="mt-1 text-[12px] text-muted-foreground max-w-[220px]">
                Upload a resume and paste a job description to see your ATS score.
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
            <ul>
              {recentResumes.map((r) => {
                const score = r.ats_score ?? 0;
                const tone = scoreTone(score);
                return (
                  <li key={r.id} className="border-b border-border last:border-0">
                    <Link href={`/dashboard/${r.id}`} className="group flex items-center gap-3 px-4 h-[52px] hover:bg-[#f8f8f9] transition-colors">
                      <FileText size={16} className="text-muted-foreground shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-foreground truncate leading-tight" title={r.file_name}>
                          {r.file_name.replace(/\.pdf$/i, "")}
                        </span>
                        <span className="block text-[11.5px] text-muted-foreground leading-tight mt-0.5">{r.dateLabel}</span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                        <span className={`text-[13px] font-semibold tabular-nums ${tone.text}`}>
                          {score > 0 ? score : "—"}
                        </span>
                      </span>
                      <ArrowUpRight size={14} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Tools */}
        <aside>
          <h2 className="text-[13px] font-medium text-foreground mb-2">Tools</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            {TOOLS.map(({ label, sub, href, icon: Icon }, i) => (
              <Link
                key={label}
                href={href}
                className={`group flex items-center gap-3 px-3.5 py-3 hover:bg-[#f8f8f9] transition-colors ${i < TOOLS.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="w-8 h-8 rounded-md border border-border flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-foreground" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-medium text-foreground leading-tight">{label}</span>
                  <span className="block text-[11.5px] text-muted-foreground leading-tight mt-0.5">{sub}</span>
                </span>
                <ArrowUpRight size={13} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
