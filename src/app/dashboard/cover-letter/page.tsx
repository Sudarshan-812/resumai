"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Loader2, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";

const EASE = [0.16, 1, 0.3, 1] as const;
const TONES = ["Professional", "Enthusiastic", "Concise"] as const;
type Tone = Lowercase<typeof TONES[number]>;

export default function CoverLetterPage() {
  const [company, setCompany]   = useState("");
  const [role, setRole]         = useState("");
  const [jobDesc, setJobDesc]   = useState("");
  const [tone, setTone]         = useState<Tone>("professional");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

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
      const reader  = res.body?.getReader();
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
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell>
      <div className="min-h-full" style={{ background: "#F7F6F2" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-10"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9B9890" }}>
              AI Tool
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#111111" }}>
              Cover Letter Generator
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#9B9890" }}>
              Fill in the details and AI writes a tailored, job-specific letter in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

            {/* Left — Form */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: EASE }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Company">
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Google"
                    className="w-full h-10 px-3.5 rounded-lg text-sm focus:outline-none transition-all"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", color: "#111111" }}
                  />
                </FormField>
                <FormField label="Job Title">
                  <input
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full h-10 px-3.5 rounded-lg text-sm focus:outline-none transition-all"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", color: "#111111" }}
                  />
                </FormField>
              </div>

              <FormField label="Job Description" hint="paste the key requirements">
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here…"
                  rows={8}
                  className="w-full px-3.5 py-3 rounded-lg text-sm focus:outline-none transition-all resize-none"
                  style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", color: "#111111" }}
                />
              </FormField>

              <FormField label="Writing Tone">
                <div className="inline-flex rounded-lg overflow-hidden" style={{ border: "1px solid #E5E3DC" }}>
                  {TONES.map((t, i) => {
                    const val = t.toLowerCase() as Tone;
                    const active = tone === val;
                    return (
                      <button
                        key={t}
                        onClick={() => setTone(val)}
                        className="h-9 px-4 text-[12px] font-medium transition-all"
                        style={{
                          background: active ? "#111111" : "#FFFFFF",
                          color: active ? "#FFFFFF" : "#6B6860",
                          borderRight: i < TONES.length - 1 ? "1px solid #E5E3DC" : undefined,
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <motion.button
                onClick={generate}
                disabled={!ready || loading}
                whileHover={ready && !loading ? { scale: 1.01 } : {}}
                whileTap={ready && !loading ? { scale: 0.98 } : {}}
                className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: "#06b6d4" }}
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" />Generating…</>
                ) : (
                  <>Generate Cover Letter <ArrowRight size={14} /></>
                )}
              </motion.button>
            </motion.div>

            {/* Right — Output */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14, duration: 0.4, ease: EASE }}
            >
              <div
                className="relative min-h-[480px] rounded-xl overflow-hidden flex flex-col"
                style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
              >
                {/* Paper header */}
                <div
                  className="flex items-center justify-between px-5 py-3 shrink-0"
                  style={{ borderBottom: "1px solid #E5E3DC", background: "#FDFCF9" }}
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "#C8C4BB" }}>
                    Cover Letter
                  </p>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5"
                    >
                      <button
                        onClick={download}
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors"
                        style={{ border: "1px solid #E5E3DC", color: "#9B9890" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9B9890")}
                      >
                        <Download size={10} /> Save
                      </button>
                      <motion.button
                        onClick={copy}
                        animate={copied ? { scale: [1, 1.1, 1] } : {}}
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors"
                        style={{ border: "1px solid #E5E3DC", color: "#9B9890" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9B9890")}
                      >
                        {copied
                          ? <><Check size={10} style={{ color: "#059669" }} />Copied</>
                          : <><Copy size={10} />Copy</>
                        }
                      </motion.button>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-5 relative">
                  <AnimatePresence mode="wait">
                    {!result && !loading && (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <p className="text-[13px]" style={{ color: "#C8C4BB" }}>
                          Your cover letter will appear here.
                        </p>
                      </motion.div>
                    )}
                    {loading && !result && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Loader2 size={20} className="animate-spin" style={{ color: "#06b6d4" }} />
                      </motion.div>
                    )}
                    {result && (
                      <motion.pre
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-pre-wrap font-sans text-[13px] leading-[1.8]"
                        style={{ color: "#111111" }}
                      >
                        {result}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>
        {label}
        {hint && <span className="normal-case font-normal tracking-normal" style={{ color: "#C8C4BB" }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
