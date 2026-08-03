"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FileText, ArrowLeft, WarningCircle as AlertCircle, X,
  CloudArrowUp as UploadCloud, CheckCircle as CheckCircle2, TextAlignLeft as AlignLeft, ArrowRight, FileX as FileWarning,
} from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";
import Stepper, { Step } from "@/app/components/ui/Stepper";

// ─── Isolated JD textarea ───────────────────────────────────────────────────
const JobDescriptionInput = memo(function JobDescriptionInput({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4" style={{ color: "#12a594" }} />
          <span className="text-sm font-medium" style={{ color: "#1c2024" }}>Paste the Job Description</span>
        </div>
        <span
          className="text-[11px] font-mono px-2 py-0.5 rounded-full"
          style={{ background: value.length > 50 ? "rgba(18,165,148,0.08)" : "#f0f0f3", color: value.length > 50 ? "#12a594" : "#80838d" }}
        >
          {value.length > 0 ? `${value.length} chars` : "Required"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder="Paste the full job description - requirements, responsibilities, qualifications…"
        rows={10}
        className="w-full px-4 py-4 rounded-2xl text-sm leading-relaxed resize-none focus:outline-none transition-all"
        style={{
          background: "#fcfcfd",
          border: "1.5px solid #d9d9e0",
          color: "#1c2024",
          lineHeight: "1.7",
        }}
        onFocus={e => { e.currentTarget.style.border = "1.5px solid #12a594"; }}
        onBlur={e => { e.currentTarget.style.border = "1.5px solid #d9d9e0"; }}
      />
      <p className="text-xs" style={{ color: "#80838d" }}>
        Include the full description for the most accurate ATS match score.
      </p>
    </div>
  );
});

// ─── Analysis loader ─────────────────────────────────────────────────────────
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
    const t = setTimeout(() => setCurrentStep(s => s + 1), 800 + Math.random() * 400);
    return () => clearTimeout(t);
  }, [currentStep]);

  return (
    <div className="w-full max-w-md mx-auto py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6"
          style={{ background: "rgba(18,165,148,0.08)", border: "1px solid rgba(18,165,148,0.15)" }}
        >
          <CoinLoader size={52} />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: "#1c2024" }}>
          Analyzing resume
        </h2>
        <p className="text-sm mb-8" style={{ color: "#80838d" }}>
          &ldquo;{fileName}&rdquo;
        </p>

        <div className="rounded-2xl p-6 text-left space-y-4" style={{ background: "#FFFFFF", border: "1px solid #d9d9e0" }}>
          {PROCESS_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={index} className="flex items-center gap-3.5">
                <div className="shrink-0 flex items-center justify-center w-5 h-5">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    >
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#12a594" }} />
                    </motion.div>
                  ) : isCurrent ? (
                    <CoinLoader size={16} />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: "#d9d9e0" }} />
                  )}
                </div>
                <span
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: isCompleted || isCurrent ? "#1c2024" : "#b9bbc6" }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Upload Page ─────────────────────────────────────────────────────────────
const UploadPage: FC = (): JSX.Element => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragStatus, setDragStatus] = useState<"idle" | "accept" | "reject">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepperKey, setStepperKey] = useState(0);

  const handleJobDescriptionChange = useCallback((value: string) => {
    setJobDescription(value);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setErrorMsg("Invalid format. Please upload a PDF file."); return; }
    if (f.size > 5 * 1024 * 1024) { setErrorMsg("File exceeds the 5MB limit."); return; }
    setFile(f);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      const items = Array.from(e.dataTransfer.items ?? []);
      const fileItem = items.find(item => item.kind === "file");
      // Some browsers withhold the MIME type until drop - treat unknown as accept.
      const isReject = !!fileItem && !!fileItem.type && fileItem.type !== "application/pdf";
      setDragStatus(isReject ? "reject" : "accept");
    } else {
      setDragStatus("idle");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragStatus("idle"); setErrorMsg(null);
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
        router.push(result.truncated ? `/dashboard/${result.id}?truncated=1` : `/dashboard/${result.id}`);
        return;
      }
      throw new Error(
        result.hint ? `${result.message}. ${result.hint}` : (result.message || "Processing failed.")
      );
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "An unexpected error occurred.");
      setIsProcessing(false);
      setStepperKey(k => k + 1);
      setCurrentStep(1);
    }
  }, [file, jobDescription, router]);

  const nextButtonDisabled =
    currentStep === 1 ? !file :
    currentStep === 2 ? jobDescription.trim().length < 30 :
    false;

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f9f9fb" }}>
      <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileSelect} />

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 md:px-10 h-16"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #d9d9e0" }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "#80838d" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Image src="/column8_black_transparent.png" alt="Column8" width={560} height={217} className="h-7 w-auto" priority />
        <div className="w-[88px]" />
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Page heading */}
              <div className="text-center mb-10">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "#80838d" }}>
                  Resume Analyzer
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2" style={{ color: "#1c2024" }}>
                  Evaluate Your Fit
                </h1>
                <p className="text-sm" style={{ color: "#60646c" }}>
                  Upload your resume and paste a job description for an instant ATS match report.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <div
                      className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl"
                      style={{ background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.18)", color: "#e11d48" }}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stepper */}
              <Stepper
                key={stepperKey}
                onStepChange={setCurrentStep}
                onFinalStepCompleted={handleSubmit}
                nextButtonProps={{ disabled: nextButtonDisabled }}
                nextButtonText="Continue"
              >
                {/* Step 1: Upload */}
                <Step>
                  <div className="py-2 space-y-4">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: "#80838d" }}>
                        Step 1 - Upload Resume
                      </p>
                      <p className="text-xs" style={{ color: "#b9bbc6" }}>PDF format, maximum 5 MB</p>
                    </div>

                    {!file ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="relative flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center"
                        style={
                          dragStatus === "reject"
                            ? { borderColor: "#e5484d", background: "rgba(229,72,77,0.05)" }
                            : dragStatus === "accept"
                            ? { borderColor: "#12a594", background: "rgba(18,165,148,0.06)" }
                            : { borderColor: "#d9d9e0", background: "#fcfcfd" }
                        }
                      >
                        <motion.div
                          animate={dragStatus !== "idle" ? { scale: 1.08 } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={
                              dragStatus === "reject"
                                ? { background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.25)" }
                                : { background: "rgba(18,165,148,0.08)", border: "1px solid rgba(18,165,148,0.15)" }
                            }
                          >
                            {dragStatus === "reject" ? (
                              <FileWarning className="w-6 h-6" style={{ color: "#e5484d" }} />
                            ) : (
                              <UploadCloud className="w-6 h-6" style={{ color: "#12a594" }} />
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1" style={{ color: dragStatus === "reject" ? "#e5484d" : "#1c2024" }}>
                            {dragStatus === "reject" ? "Only PDF files are supported" : "Drop your resume here"}
                          </p>
                          <p className="text-xs mb-4" style={{ color: "#80838d" }}>or click to browse files</p>
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                            style={{ background: "#FFFFFF", border: "1px solid #d9d9e0", color: "#60646c" }}
                          >
                            Browse Files
                          </span>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-5 rounded-2xl"
                        style={{ background: "#FFFFFF", border: "1px solid #d9d9e0" }}
                      >
                        <div
                          className="w-12 h-14 rounded-xl flex items-center justify-center shrink-0 relative"
                          style={{ background: "rgba(18,165,148,0.06)", border: "1px solid rgba(18,165,148,0.15)" }}
                        >
                          <div className="absolute top-0 right-0 w-4 h-4 rounded-bl-lg rounded-tr-xl" style={{ background: "rgba(18,165,148,0.12)" }} />
                          <FileText className="w-5 h-5" style={{ color: "#12a594" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#1c2024" }}>{file.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#80838d" }}>{(file.size / 1024).toFixed(0)} KB · PDF</p>
                        </div>
                        <motion.button
                          onClick={e => { e.stopPropagation(); handleRemoveFile(); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#f9f9fb", color: "#80838d" }}
                          whileHover={{ scale: 1.15, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </Step>

                {/* Step 2: Job Description */}
                <Step>
                  <div className="py-2">
                    <div className="mb-4">
                      <p className="text-[11px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: "#80838d" }}>
                        Step 2 - Job Description
                      </p>
                    </div>
                    <JobDescriptionInput value={jobDescription} onValueChange={handleJobDescriptionChange} />
                  </div>
                </Step>

                {/* Step 3: Confirm */}
                <Step>
                  <div className="py-2 space-y-4">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: "#80838d" }}>
                        Step 3 - Confirm & Analyze
                      </p>
                      <p className="text-xs" style={{ color: "#b9bbc6" }}>Review your inputs before generating the report</p>
                    </div>

                    <div className="space-y-3">
                      {/* File card */}
                      <div
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ background: "#fcfcfd", border: "1px solid #d9d9e0" }}
                      >
                        <div
                          className="w-9 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(18,165,148,0.08)" }}
                        >
                          <FileText className="w-4 h-4" style={{ color: "#12a594" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono uppercase tracking-[0.12em] mb-0.5" style={{ color: "#80838d" }}>Resume</p>
                          <p className="text-sm font-medium truncate" style={{ color: "#1c2024" }}>{file?.name}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#12a594" }} />
                      </div>

                      {/* JD preview */}
                      <div className="p-4 rounded-xl" style={{ background: "#fcfcfd", border: "1px solid #d9d9e0" }}>
                        <p className="text-[10px] font-mono uppercase tracking-[0.12em] mb-2" style={{ color: "#80838d" }}>Job Description</p>
                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#60646c" }}>
                          {jobDescription.slice(0, 200)}{jobDescription.length > 200 ? "…" : ""}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "#b9bbc6" }}>{jobDescription.length} characters</p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2.5 p-3.5 rounded-xl"
                      style={{ background: "rgba(18,165,148,0.05)", border: "1px solid rgba(18,165,148,0.15)" }}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#12a594" }} />
                      <p className="text-xs" style={{ color: "#008573" }}>
                        Ready to analyze. Click <strong>Analyze Resume</strong> to get your ATS report.
                      </p>
                    </div>
                  </div>
                </Step>
              </Stepper>
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
