"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Loader2, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavbarWrapper from "@/app/dashboard/NavbarWrapper";

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
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
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

  return (
    <div className="min-h-screen bg-background pb-16 px-4">
      <NavbarWrapper />
      <div className="max-w-3xl mx-auto pt-28">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
            <FileText size={12} /> Cover Letter Generator
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Craft a tailored cover letter.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Fill in the details below and AI will write a job-specific cover letter in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                Company Name
              </label>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                Job Title
              </label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                Job Description <span className="text-muted-foreground/60 normal-case font-normal">(paste relevant parts)</span>
              </label>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                Tone
              </label>
              <div className="flex gap-2">
                {(["professional", "enthusiastic", "concise"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-all capitalize",
                      tone === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generate}
              disabled={!ready || loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 transition-all"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin mr-2" /> Generating...</>
              ) : (
                <><Sparkles size={15} className="mr-2" /> Generate Cover Letter</>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="relative">
            <div className={cn(
              "w-full min-h-[400px] rounded-2xl border bg-card p-6 text-sm leading-relaxed text-foreground transition-all",
              result ? "border-border" : "border-dashed border-border/50"
            )}>
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16"
                  >
                    <FileText size={32} strokeWidth={1} className="mb-4 opacity-30" />
                    <p className="text-xs">Your cover letter will appear here.</p>
                  </motion.div>
                )}
                {loading && !result && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center py-16"
                  >
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </motion.div>
                )}
                {result && (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {result && (
              <motion.button
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={copy}
                className="absolute top-3 right-3 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-background border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
