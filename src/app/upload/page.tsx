"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Loader2, ArrowLeft, AlertCircle, X,
  UploadCloud, CheckCircle2, ArrowRight, AlignLeft
} from "lucide-react";
import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";

// ─── Isolated JD textarea ───
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
    <div className="relative flex flex-col h-full rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <AlignLeft className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Job Description</h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {value.length > 0 ? `${value.length} chars` : "Required"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the requirements, responsibilities, and qualifications for the role here..."
        className="w-full flex-1 bg-transparent px-5 py-4 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-0"
      />
    </div>
  );
});

// ─── Professional Loading State ───
const PROCESS_STEPS = [
  "Parsing document structure",
  "Extracting textual content",
  "Analyzing job requirements",
  "Evaluating candidate fit",
  "Generating feedback report",
];

function AnalysisLoader({ fileName }: { fileName: string }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= PROCESS_STEPS.length) return;
    const t = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 800 + Math.random() * 400);
    return () => clearTimeout(t);
  }, [currentStep]);

  return (
    <div className="w-full max-w-xl mx-auto py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted border border-border mb-5">
          <Loader2 className="w-6 h-6 text-foreground animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">Analyzing "{fileName}"</h2>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we evaluate the match.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          {PROCESS_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-border" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isCompleted ? "text-foreground" : isCurrent ? "text-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJobDescriptionChange = useCallback((value: string) => {
    setJobDescription(value);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMsg(null);
      const f = e.target.files?.[0];
      if (!f) return;
      if (f.type !== "application/pdf") {
        setErrorMsg("Invalid format. Please upload a PDF file.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg("File exceeds the 5MB limit.");
        return;
      }
      setFile(f);
    },
    []
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMsg(null);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") setFile(f);
    else setErrorMsg("Invalid format. Please upload a PDF file.");
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file || !jobDescription.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobDescription", jobDescription);
      const result = await processResume(fd);
      if (result.success && result.id) {
        router.push(
          result.truncated
            ? `/dashboard/${result.id}?truncated=1`
            : `/dashboard/${result.id}`
        );
        return;
      }
      throw new Error(result.message || "Processing failed.");
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
      setIsProcessing(false);
    }
  }, [file, jobDescription, router]);

  const isValid = !!file && jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        hidden
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border bg-background">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span className="font-semibold text-sm tracking-tight">ResumAI</span>
        <div className="w-[88px]" /> {/* Spacer */}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header Section */}
              <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
                  Evaluate Candidate Fit
                </h1>
                <p className="text-base text-muted-foreground max-w-xl">
                  Upload a resume and provide the corresponding job description to receive a detailed matching report.
                </p>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[400px]">
                
                {/* Left: Upload Zone */}
                <div className="flex flex-col h-full">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "flex-1 relative flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed transition-colors duration-200",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : file
                        ? "border-border bg-muted/10 border-solid"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    {!file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4 text-muted-foreground">
                          <UploadCloud className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-1">Select a document</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Drag and drop a PDF, or click below.
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-9 px-5 rounded-md bg-background border border-border text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          Browse Files
                        </button>
                        <p className="text-xs text-muted-foreground mt-4">PDF up to 5MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full max-w-xs">
                        <div className="w-16 h-20 bg-background rounded-lg border border-border shadow-sm flex items-center justify-center mb-4 relative">
                          <div className="absolute top-0 right-0 w-6 h-6 bg-muted rounded-bl-lg border-l border-b border-border" />
                          <FileText className="w-6 h-6 text-foreground/70" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-foreground truncate w-full px-4 mb-1">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mb-6">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                        <button
                          onClick={handleRemoveFile}
                          className="h-8 px-4 rounded-md border border-border text-xs font-medium text-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30 transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Job Description */}
                <div className="h-[360px] lg:h-auto">
                  <JobDescriptionInput onValueChange={handleJobDescriptionChange} />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-3 rounded-xl">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Bar */}
              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Ensure both fields are completed to continue.
                </p>
                <button
                  disabled={!isValid}
                  onClick={handleSubmit}
                  className={cn(
                    "w-full sm:w-auto h-11 px-8 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2",
                    isValid
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Generate Report
                  {isValid && <ArrowRight className="w-4 h-4 ml-1" />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalysisLoader fileName={file?.name ?? "document.pdf"} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadPage;