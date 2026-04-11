"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Loader2, ArrowLeft, AlertCircle, X,
  UploadCloud, Briefcase, CheckCircle2, ArrowRight, ChevronRight
} from "lucide-react";
import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";

// ─── Isolated JD textarea — keystrokes only re-render this component ───
const JobDescriptionInput = memo(function JobDescriptionInput({
  onValueChange,
}: {
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onValueChange(e.target.value);
    },
    [onValueChange]
  );
  return (
    <div className="relative flex flex-col flex-1">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the full job description here — include requirements, responsibilities, and preferred qualifications for the best results..."
        className="flex-1 w-full bg-transparent border-none p-5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
        style={{ minHeight: 240 }}
      />
      <div className="px-5 pb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {value.length > 0 ? (
            <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 inline" /> Job description loaded</span>
          ) : "Paste JD above"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/40">{value.length} chars</span>
      </div>
    </div>
  );
});

// ─── Analysis log steps ───
const LOG_STEPS = [
  "Parsing PDF structure...",
  "Extracting text layers...",
  "Tokenizing job description...",
  "Running keyword extraction engine...",
  "Mapping skills to JD requirements...",
  "Calculating weighted ATS score...",
  "Detecting formatting issues...",
  "Generating recruiter feedback...",
  "Saving to your workspace...",
];

function AnalysisLoader({ fileName }: { fileName: string }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    if (step >= LOG_STEPS.length) return;
    const t = setTimeout(() => {
      setDone((d) => [...d, step]);
      setStep((s) => s + 1);
    }, 700 + Math.random() * 350);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Pulsing orb */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-24 h-24 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
          <div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="text-primary"><rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">Analyzing your resume</h2>
        <p className="text-sm text-muted-foreground">Scanning <span className="font-medium text-foreground">{fileName}</span></p>
      </div>

      {/* Terminal log */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            {["bg-rose-500/40", "bg-amber-500/40", "bg-emerald-500/40"].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-2">
            analysis.log
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-500 uppercase">Active</span>
          </div>
        </div>
        <div className="p-5 space-y-2.5 font-mono text-xs min-h-[280px]">
          {LOG_STEPS.map((msg, i) => (
            <AnimatePresence key={i}>
              {i <= step && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {done.includes(i) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  )}
                  <span className={cn(
                    "transition-colors",
                    done.includes(i) ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                  )}>
                    {done.includes(i) ? "✓ " : "→ "}{msg}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
          {step <= LOG_STEPS.length && (
            <motion.span
              className="inline-block w-2 h-4 bg-primary ml-6 align-middle opacity-80"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Upload Page ───
const UploadPage: FC = (): JSX.Element => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJobDescriptionChange = useCallback((value: string) => {
    setJobDescription(value);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setErrorMsg("Please upload a valid PDF file."); return; }
    if (f.size > 5 * 1024 * 1024) { setErrorMsg("File must be under 5MB."); return; }
    setFile(f);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); setErrorMsg(null);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") setFile(f);
    else setErrorMsg("Please upload a valid PDF file.");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file || !jobDescription.trim()) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobDescription", jobDescription);
      const result = await processResume(fd);
      if (result.success && result.id) {
        router.push(`/dashboard/${result.id}`);
        return;
      }
      throw new Error(result.message || "Analysis failed.");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setIsUploading(false);
    }
  }, [file, jobDescription, router]);

  const canAnalyze = !!file && jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background sticky top-0 z-20">
        <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-foreground text-background flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className="font-semibold text-[13px] text-foreground">ResumAI</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="flex flex-col items-center px-4 py-12">
        <AnimatePresence mode="wait">

          {/* ─── UPLOAD FORM ─── */}
          {!isUploading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl"
            >
              {/* Page header */}
              <div className="text-center mb-10">
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3"
                >
                  New Resume Analysis
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground text-[15px] max-w-md mx-auto"
                >
                  Upload your PDF and paste the job description to get an ATS score with keyword feedback in ~10 seconds.
                </motion.p>
              </div>

              {/* Step indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-0 mb-8"
              >
                {[
                  { n: "01", label: "Resume", done: !!file },
                  { n: "02", label: "Job Description", done: jobDescription.trim().length > 0 },
                  { n: "03", label: "Analyze", done: false },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono transition-all",
                        s.done
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : "border-border bg-muted text-muted-foreground"
                      )}>
                        {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : s.n}
                      </div>
                      <span className={cn(
                        "text-xs font-medium hidden sm:block transition-colors",
                        s.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && <div className="w-8 md:w-16 h-px bg-border mx-2 md:mx-3" />}
                  </div>
                ))}
              </motion.div>

              {/* Input panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                {/* PDF Upload panel */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300",
                    file ? "border-emerald-500/30" : "border-border"
                  )}
                  style={{ minHeight: 360 }}
                >
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/20">
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                      file ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    )}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Your Resume</h3>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">PDF · max 5MB</span>
                  </div>

                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center p-8 transition-all duration-200 m-2 rounded-xl border-2",
                      isDragging ? "bg-primary/5 border-primary border-dashed" : "border-transparent"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {!file ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col items-center text-center"
                        >
                          <motion.div
                            className="mb-5 h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground"
                            animate={isDragging ? { scale: 1.1, borderColor: "var(--color-primary)" } : { scale: 1 }}
                          >
                            <UploadCloud strokeWidth={1.5} className="h-7 w-7" />
                          </motion.div>
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {isDragging ? "Drop it here" : "Drag & drop your PDF"}
                          </p>
                          <p className="text-xs text-muted-foreground mb-6">or click to browse your files</p>
                          <label className="cursor-pointer">
                            <span className="px-6 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all active:scale-[0.98] inline-block">
                              Browse Files
                            </span>
                            <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileSelect} />
                          </label>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="file"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="flex flex-col items-center text-center w-full"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-sm"
                          >
                            <FileText className="h-7 w-7" />
                          </motion.div>
                          <p className="font-semibold text-sm text-foreground mb-1 max-w-[220px] truncate px-2">{file.name}</p>
                          <div className="flex items-center gap-2 mb-5">
                            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          </div>
                          <button
                            onClick={() => setFile(null)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                          >
                            <X size={14} /> Remove File
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* JD panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
                  style={{ minHeight: 360 }}
                >
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/20">
                    <div className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Job Description</h3>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">Paste full JD for best results</span>
                  </div>
                  <JobDescriptionInput onValueChange={handleJobDescriptionChange} />
                </motion.div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl mb-5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  disabled={!canAnalyze}
                  onClick={handleAnalyze}
                  whileHover={canAnalyze ? { y: -1 } : {}}
                  whileTap={canAnalyze ? { scale: 0.98 } : {}}
                  className={cn(
                    "h-11 px-10 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
                    canAnalyze
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Analyze Resume
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <p className="mt-3 text-[11px] text-muted-foreground/70 text-center">
                  Takes ~10 seconds · Saved to your dashboard
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ─── ANALYZING STATE ─── */}
          {isUploading && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-xl flex flex-col items-center py-8"
            >
              <AnalysisLoader fileName={file?.name ?? "resume.pdf"} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadPage;
