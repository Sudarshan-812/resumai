"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, DownloadSimple as Download, ArrowRight, FileText, PencilLine } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/dashboard/spotlight-card";
import { CoinLoader } from "@/components/ui/coin-loader";

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;
const TONES  = ["Professional", "Enthusiastic", "Concise"] as const;
type Tone = Lowercase<typeof TONES[number]>;

/* ── Floating-label input ────────────────────────────────────── */
function FloatingInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <motion.label
        animate={active ? { y: -22, scale: 0.82, color: "#12a594" } : { y: 0, scale: 1, color: "#60646c" }}
        transition={{ duration: 0.18, ease: EASE }}
        className="absolute left-0 top-3 text-sm font-medium origin-left pointer-events-none"
      >
        {label}
      </motion.label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={active ? placeholder : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-11 pt-3 text-[14px] bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/40 border-b-2 transition-colors"
        style={{ borderColor: focused ? "var(--primary)" : "var(--border)" }}
      />
    </div>
  );
}

export default function CoverLetterPage() {
  const [company, setCompany] = useState("");
  const [role, setRole]       = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tone, setTone]       = useState<Tone>("professional");
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

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
    setTimeout(() => setCopied(false), 2200);
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
      <div className="bg-background min-h-full">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/15">
              <PencilLine size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-1 text-muted-foreground">
                AI Tool
              </p>
              <h1 className="font-display font-semibold tracking-tight text-foreground" style={{ fontSize: "clamp(22px, 4vw, 32px)", lineHeight: 1.15 }}>
                Cover Letter
              </h1>
            </div>
          </motion.div>

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, type: "spring", stiffness: 220, damping: 26 }}
            className="rounded-3xl border border-border bg-card p-7 md:p-8 space-y-8 mb-10"
          >
            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-8">
              <FloatingInput label="Company" value={company} onChange={setCompany} placeholder="Google" />
              <FloatingInput label="Role" value={role} onChange={setRole} placeholder="Software Engineer" />
            </div>

            {/* Job description */}
            <JobDescArea value={jobDesc} onChange={setJobDesc} />

            {/* Tone */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5 text-muted-foreground">Tone</p>
              <div className="flex items-center gap-2">
                {TONES.map((t) => {
                  const val = t.toLowerCase() as Tone;
                  const active = tone === val;
                  return (
                    <motion.button
                      key={t}
                      onClick={() => setTone(val)}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
                      transition={SPRING}
                      className={`h-9 px-4 rounded-full text-[12px] font-semibold border transition-colors ${
                        active ? "bg-primary text-white border-primary" : "bg-transparent text-muted-foreground border-border hover:border-foreground/20"
                      }`}
                    >
                      {t}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Generate */}
            <motion.button
              onClick={generate}
              disabled={!ready || loading}
              whileHover={ready && !loading ? { y: -2, boxShadow: "0 16px 36px rgba(18,165,148,0.28)" } : {}}
              whileTap={ready && !loading ? { scale: 0.98 } : {}}
              transition={SPRING}
              className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed bg-primary shadow-lg shadow-primary/20"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    <CoinLoader size={18} className="text-current" /> Generating…
                  </motion.span>
                ) : (
                  <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    Generate Cover Letter <ArrowRight size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* ── Output ── */}
          <AnimatePresence>
            {(result || loading) && (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
              >
                <SpotlightCard className="p-7 md:p-8">
                  {/* Output header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={loading ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <FileText size={18} className={loading ? "text-primary" : "text-muted-foreground/50"} />
                      </motion.div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        {loading ? "Writing…" : "Cover Letter"}
                      </p>
                      {loading && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.7, repeat: Infinity }}
                          className="text-[9px] font-mono text-primary"
                        >▋</motion.span>
                      )}
                    </div>
                    {result && !loading && (
                      <motion.div
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                        transition={SPRING}
                        className="flex items-center gap-2"
                      >
                        <motion.button
                          onClick={download}
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.93 }} transition={SPRING}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-medium border border-border text-muted-foreground bg-card"
                        >
                          <Download size={14} /> Save
                        </motion.button>
                        <motion.button
                          onClick={copy}
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.93 }} transition={SPRING}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-medium transition-colors border ${
                            copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground bg-card"
                          }`}
                        >
                          <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING}>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </motion.span>
                          {copied ? "Copied!" : "Copy"}
                        </motion.button>
                      </motion.div>
                    )}
                  </div>

                  {/* Letter text */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <p className="text-[14px] leading-[1.95] whitespace-pre-wrap text-foreground">
                      {result}
                      {loading && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="text-primary font-bold"
                        >▋</motion.span>
                      )}
                    </p>
                  </motion.div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
  );
}

/* ── Job description textarea ────────────────────────────────── */
function JobDescArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const charOk = value.trim().length >= 50;
  const active = focused || value.length > 0;
  return (
    <div>
      <div className="relative">
        <motion.label
          animate={active ? { y: 0, scale: 0.82, color: "#12a594" } : { y: 26, scale: 1, color: "#60646c" }}
          transition={{ duration: 0.18, ease: EASE }}
          className="absolute left-0 top-0 text-sm font-medium origin-left pointer-events-none"
        >
          Job Description <span className="normal-case font-normal opacity-60">- paste the key requirements</span>
        </motion.label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? "Paste the job description here - at least 50 characters for best results…" : ""}
          rows={7}
          className="w-full pt-7 bg-transparent text-[13.5px] leading-[1.85] resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/40 pb-3 border-b-2 transition-colors"
          style={{ borderColor: focused ? "var(--primary)" : "var(--border)" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] ${charOk ? "text-emerald-600" : "text-muted-foreground"}`}>
          {value.trim().length} chars{charOk ? " ✓" : " (min 50)"}
        </span>
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            onClick={() => onChange("")}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
          >
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
}
