"use client";

import { useState, useEffect } from "react";
import {
  Copy, Check, DownloadSimple as Download, ArrowRight, FileText,
  CaretDown as ChevronDown,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ResumeOption { id: string; file_name: string }

const TONES = ["Professional", "Enthusiastic", "Concise"] as const;
type Tone = Lowercase<typeof TONES[number]>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-medium text-foreground mb-1.5">{children}</p>;
}

export default function CoverLetterPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeId, setResumeId] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("resumes")
          .select("id, file_name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) setResumes(data);
      } finally {
        setResumesLoading(false);
      }
    })();
  }, []);

  const charOk = jobDesc.trim().length >= 50;
  const ready = company.trim() && role.trim() && charOk;

  const generate = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, jobDesc, tone, resumeId: resumeId || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream");
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setResult(text);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2200);
  };

  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-") || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "w-full h-9 px-3 rounded-md text-[13px] bg-white border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-8 py-8">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Cover Letter</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Generate a tailored cover letter from a job description. Free, unlimited.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-border p-5 md:p-6 space-y-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Company</FieldLabel>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" className={inputCls} />
          </div>
          <div>
            <FieldLabel>Role</FieldLabel>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className={inputCls} />
          </div>
        </div>

        <div>
          <FieldLabel>
            Job description <span className="font-normal text-muted-foreground">- paste the key requirements</span>
          </FieldLabel>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here - at least 50 characters for best results."
            rows={7}
            className="w-full px-3 py-2.5 rounded-md text-[13px] leading-relaxed bg-white border border-input text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-[11.5px] ${charOk ? "text-emerald-600" : "text-muted-foreground"}`}>
              {jobDesc.trim().length} chars{charOk ? " OK" : " (min 50)"}
            </span>
            {jobDesc.length > 0 && (
              <button onClick={() => setJobDesc("")} className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <FieldLabel>
            Resume <span className="font-normal text-muted-foreground">- optional, grounds the letter in your real experience</span>
          </FieldLabel>
          {resumesLoading ? (
            <div className={cn(inputCls, "flex items-center gap-2 pointer-events-none")}>
              <CoinLoader size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Loading resumes...</span>
            </div>
          ) : (
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className={cn(
                  "w-full h-9 pl-9 pr-9 rounded-md text-[13px] appearance-none cursor-pointer bg-white border border-input focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all",
                  resumeId ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <option value="">None - write a generic letter</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.file_name.replace(/\.pdf$/i, "")}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Tone</FieldLabel>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {TONES.map((t, i) => {
              const val = t.toLowerCase() as Tone;
              const active = tone === val;
              return (
                <button
                  key={t}
                  onClick={() => setTone(val)}
                  className={cn(
                    "h-8 px-3.5 text-[12.5px] font-medium transition-colors",
                    i > 0 && "border-l border-border",
                    active ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9]"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!ready || loading}
          className="w-full h-9 rounded-md text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-primary hover:bg-[#0f9184] disabled:opacity-35 disabled:pointer-events-none transition-colors"
        >
          {loading ? (
            <><CoinLoader size={15} className="text-current" /> Generating...</>
          ) : (
            <>Generate cover letter <ArrowRight size={15} /></>
          )}
        </button>
      </div>

      {/* Output */}
      {(result || loading) && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText size={15} className={loading ? "text-primary" : "text-muted-foreground"} />
              <span className="text-[12px] font-medium text-foreground">
                {loading ? "Writing..." : "Cover letter"}
              </span>
            </div>
            {result && !loading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={download}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9] transition-colors"
                >
                  <Download size={13} /> Save
                </button>
                <button
                  onClick={copy}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium border transition-colors",
                    copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground hover:text-foreground hover:bg-[#f8f8f9]"
                  )}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <div className="px-5 py-5">
            <p className="text-[13.5px] leading-[1.9] whitespace-pre-wrap text-foreground">
              {result}
              {loading && <span className="text-primary font-semibold animate-pulse">|</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
