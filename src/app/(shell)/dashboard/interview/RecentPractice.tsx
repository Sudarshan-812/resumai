"use client";

import { useEffect, useState } from "react";
import { Microphone as Mic, TextT, ArrowClockwise } from "@phosphor-icons/react";

interface InterviewRow {
  id: string;
  mode: "voice" | "text";
  role: string | null;
  score: number | null;
  summary: string | null;
  highlight: string | null;
  created_at: string;
}

const scoreColor = (s: number) => (s >= 70 ? "#059669" : s >= 50 ? "#d97706" : "#e11d48");

function ago(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export default function RecentPractice() {
  const [rows, setRows] = useState<InterviewRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/interview/history?limit=5")
      .then((r) => (r.ok ? r.json() : { interviews: [] }))
      .then((d) => {
        if (!cancelled) setRows(Array.isArray(d.interviews) ? d.interviews : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-12">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-4 text-muted-foreground/60">
        Recent practice
      </p>
      <div className="rounded-2xl border border-border overflow-hidden">
        {rows.map((r, i) => {
          const Icon = r.mode === "voice" ? Mic : TextT;
          const s = r.score ?? 0;
          return (
            <div
              key={r.id}
              className={`px-4 py-3.5 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-border">
                  <Icon size={14} className="text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground capitalize">
                    {r.mode} interview
                    {r.role ? <span className="font-normal text-muted-foreground"> · {r.role}</span> : null}
                  </p>
                  <p className="text-[10.5px] font-mono text-muted-foreground/60">{ago(r.created_at)}</p>
                </div>
                {r.score != null && (
                  <span
                    className="text-[15px] font-black font-mono tabular-nums shrink-0"
                    style={{ color: scoreColor(s), letterSpacing: "-0.02em" }}
                  >
                    {s}
                  </span>
                )}
              </div>
              {r.mode === "voice" && r.highlight && (
                <div className="mt-2 ml-10 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                  <ArrowClockwise size={13} className="mt-0.5 shrink-0 text-primary" />
                  <span>Re-practise: {r.highlight}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
