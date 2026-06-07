"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Loader2, Download, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;
const TONES  = ["Professional", "Enthusiastic", "Concise"] as const;
type Tone = Lowercase<typeof TONES[number]>;

/* ── Underline input ─────────────────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5" style={{ color: "#6B6860" }}>
        {label}{hint && <span className="ml-2 normal-case font-normal tracking-normal" style={{ color: "#9B9890" }}>— {hint}</span>}
      </p>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full py-2 text-[14px] bg-transparent focus:outline-none placeholder:text-[#B8B4AA]"
        style={{ color: "#111111", borderBottom: `1px solid ${focused ? "#06b6d4" : "#C8C4BB"}`, transition: "border-color 0.2s" }}
      />
      {focused && (
        <motion.div
          layoutId="input-focus"
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          style={{ background: "#06b6d4" }}
          transition={{ duration: 0.25, ease: EASE }}
        />
      )}
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
    <DashboardShell>
      <div style={{ background: "#F7F6F2", minHeight: "100%" }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-12"
          >
            <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: "#9B9890" }}>
              AI Tool
            </p>
            <h1 className="font-display font-semibold tracking-tight mb-2"
              style={{ color: "#111111", fontSize: "clamp(24px, 5vw, 38px)", lineHeight: 1.15 }}>
              Cover Letter
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#6B6860" }}>
              Fill in the details — get a tailored, job-specific letter in seconds.
            </p>
          </motion.div>

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, type: "spring", stiffness: 220, damping: 26 }}
            className="space-y-8 mb-10"
          >
            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-8">
              <Field label="Company">
                <TextInput value={company} onChange={setCompany} placeholder="Google" />
              </Field>
              <Field label="Role">
                <TextInput value={role} onChange={setRole} placeholder="Software Engineer" />
              </Field>
            </div>

            {/* Job description */}
            <Field label="Job Description" hint="paste the key requirements">
              <JobDescArea value={jobDesc} onChange={setJobDesc} />
            </Field>

            {/* Tone */}
            <Field label="Tone">
              <div className="flex items-center gap-2 pt-1">
                {TONES.map((t, i) => {
                  const val = t.toLowerCase() as Tone;
                  const active = tone === val;
                  return (
                    <motion.button
                      key={t}
                      onClick={() => setTone(val)}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
                      transition={SPRING}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        transitionProperty: "background, color, border-color",
                        transitionDuration: "0.18s",
                      }}
                      className="h-8 px-4 rounded-full text-[11px] font-semibold"
                    >
                      <motion.span
                        animate={{
                          background: active ? "#111111" : "#FFFFFF",
                          color: active ? "#FFFFFF" : "#6B6860",
                          border: active ? "1px solid #111111" : "1px solid #E5E3DC",
                        }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center h-full px-4 rounded-full text-[11px] font-semibold"
                        style={{ border: "1px solid #E5E3DC" }}
                      >
                        {t}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </div>
            </Field>

            {/* Generate */}
            <motion.button
              onClick={generate}
              disabled={!ready || loading}
              whileHover={ready && !loading ? { y: -2, boxShadow: "0 16px 36px rgba(6,182,212,0.28)" } : {}}
              whileTap={ready && !loading ? { scale: 0.98 } : {}}
              transition={SPRING}
              className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)", boxShadow: "0 4px 20px rgba(6,182,212,0.18)" }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Generating…
                  </motion.span>
                ) : (
                  <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    Generate Cover Letter <ArrowRight size={14} />
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
                {/* Divider */}
                <div className="mb-8" style={{ height: 1, background: "#E5E3DC" }} />

                {/* Output header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={loading ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FileText size={13} style={{ color: loading ? "#06b6d4" : "#C8C4BB" }} strokeWidth={1.5} />
                    </motion.div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: "#6B6860" }}>
                      {loading ? "Writing…" : "Cover Letter"}
                    </p>
                    {loading && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                        className="text-[9px] font-mono"
                        style={{ color: "#06b6d4" }}
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
                        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium"
                        style={{ border: "1px solid #E5E3DC", color: "#9B9890", background: "#FFFFFF" }}
                      >
                        <Download size={10} /> Save
                      </motion.button>
                      <motion.button
                        onClick={copy}
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.93 }} transition={SPRING}
                        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium transition-colors"
                        style={copied
                          ? { border: "1px solid rgba(5,150,105,0.3)", background: "rgba(5,150,105,0.07)", color: "#059669" }
                          : { border: "1px solid #E5E3DC", color: "#9B9890", background: "#FFFFFF" }
                        }
                      >
                        <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING}>
                          {copied ? <Check size={10} /> : <Copy size={10} />}
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
                  <p
                    className="text-[14px] leading-[1.95] whitespace-pre-wrap"
                    style={{ color: "#111111", fontFamily: "inherit" }}
                  >
                    {result}
                    {loading && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        style={{ color: "#06b6d4", fontWeight: 700 }}
                      >▋</motion.span>
                    )}
                  </p>
                </motion.div>

                <div className="h-12" />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </DashboardShell>
  );
}

/* ── Job description textarea ────────────────────────────────── */
function JobDescArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const charOk = value.trim().length >= 50;
  return (
    <div>
      <div className="relative pt-2">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Paste the job description here — at least 50 characters for best results…"
          rows={7}
          className="w-full bg-transparent text-[13.5px] leading-[1.85] resize-none focus:outline-none placeholder:text-[#B8B4AA] pb-3"
          style={{
            color: "#111111",
            borderBottom: `1px solid ${focused ? "#06b6d4" : "#C8C4BB"}`,
            transition: "border-color 0.2s",
          }}
        />
        {focused && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            style={{ background: "#06b6d4" }}
            transition={{ duration: 0.28, ease: EASE }}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px]" style={{ color: charOk ? "#059669" : "#9B9890" }}>
          {value.trim().length} chars{charOk ? " ✓" : " (min 50)"}
        </span>
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            onClick={() => onChange("")}
            className="text-[10px]" style={{ color: "#C8C4BB" }}
          >
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
}
