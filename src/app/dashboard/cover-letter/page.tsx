"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardShell from "@/app/dashboard/DashboardShell";

export default function CoverLetterPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ready = company.trim() && role.trim() && jobDesc.trim().length > 50;

  const generate = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, jobDesc, tone }),
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
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-2">
            <FileText size={11} />
            AI Tool
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cover Letter Generator</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Fill in the details and AI will write a tailored, job-specific cover letter in seconds.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">

            <Field label="Company Name">
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
            </Field>

            <Field label="Job Title">
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
            </Field>

            <Field label="Job Description" hint="paste the key requirements">
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-3.5 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
              />
            </Field>

            <Field label="Writing Tone">
              <div className="flex gap-2">
                {(["professional", "enthusiastic", "concise"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-[12px] font-semibold border transition-all capitalize",
                      tone === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-card text-muted-foreground border-border hover:border-blue-500/30 hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Button
              onClick={generate}
              disabled={!ready || loading}
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm shadow-blue-500/20 disabled:opacity-40 transition-all"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin mr-2" />Generating...</>
                : <><Sparkles size={14} className="mr-2" />Generate Cover Letter</>
              }
            </Button>
          </div>

          {/* Output */}
          <div className="relative">
            <div className={cn(
              "w-full min-h-[420px] rounded-2xl border bg-card p-5 text-sm leading-relaxed text-foreground transition-all",
              result ? "border-border" : "border-dashed border-border/50"
            )}>
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16"
                  >
                    <FileText size={28} strokeWidth={1} className="mb-3 opacity-25" />
                    <p className="text-xs text-muted-foreground/70">Your cover letter will appear here.</p>
                  </motion.div>
                )}
                {loading && !result && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center py-16"
                  >
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                  </motion.div>
                )}
                {result && (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{result}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-3 right-3 flex items-center gap-1.5"
              >
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-background border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                >
                  <Download size={11} /> Save
                </button>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-background border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
        {hint && <span className="normal-case font-normal tracking-normal text-muted-foreground/60">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
