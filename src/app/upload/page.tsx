"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
  X,
  UploadCloud,
  Briefcase,
  Sparkles
} from "lucide-react";

import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const UploadPage: FC = (): JSX.Element => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const kiloByte = 1024;
    const units = ["Bytes", "KB", "MB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(kiloByte));
    return `${(bytes / kiloByte ** unitIndex).toFixed(1)} ${units[unitIndex]}`;
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMsg(null);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setErrorMsg("Please upload a valid PDF file.");
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleDrag = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") setIsDragging(true);
    else if (event.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setErrorMsg(null);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      setErrorMsg("Please upload a valid PDF file.");
    }
  }, []);

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!file || !jobDescription.trim()) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const result = await processResume(formData);

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

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--color-foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* Top Navigation */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 border-b border-border bg-background/80 backdrop-blur-md">
        <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          
          {/* Header Text */}
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Targeted Match Analysis
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              New Analysis
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
              Upload your resume and the job description to see how well you match and get AI-powered improvement suggestions.
            </p>
          </div>

          {/* Upload & Input Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* ─── LEFT: PDF UPLOAD ─── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-[380px]"
            >
              <div className="border-b border-border bg-muted/30 px-5 py-4 flex items-center gap-2.5">
                 <FileText className="w-4 h-4 text-muted-foreground" />
                 <h3 className="text-sm font-semibold text-foreground">Your Resume</h3>
              </div>
              
              <div 
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                className={cn(
                  "flex-1 relative flex flex-col items-center justify-center p-8 transition-all duration-200",
                  isDragging ? "bg-primary/5 border-2 border-primary border-dashed m-2 rounded-xl" : "bg-transparent border-2 border-transparent m-2"
                )}
              >
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center w-full">
                      <div className="mb-5 h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <UploadCloud strokeWidth={2} className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">Click or drag file to this area</p>
                      <p className="text-xs text-muted-foreground mb-6">PDF files up to 5MB</p>
                      
                      <label className="cursor-pointer">
                        <div className="px-6 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all active:scale-[0.98]">
                            Browse Files
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileSelect} />
                      </label>
                    </motion.div>
                  ) : (
                    <motion.div key="file" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center w-full">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-sm text-foreground mb-1 max-w-full truncate px-4">{file.name}</p>
                      <p className="text-xs text-muted-foreground mb-6">{formatFileSize(file.size)}</p>
                      
                      <button onClick={() => setFile(null)} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-rose-500/10">
                        <X size={14} /> Remove File
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ─── RIGHT: JD INPUT ─── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-[380px]"
            >
              <div className="border-b border-border bg-muted/30 px-5 py-4 flex items-center gap-2.5">
                 <Briefcase className="w-4 h-4 text-muted-foreground" />
                 <h3 className="text-sm font-semibold text-foreground">Job Description</h3>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="flex-1 w-full bg-transparent border-none p-5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-0 custom-scrollbar"
              />
            </motion.div>
          </div>

          {/* ─── ACTION BUTTON ─── */}
          <div className="mt-10 flex flex-col items-center">
            <Button
              disabled={isUploading || !file || !jobDescription.trim()}
              onClick={handleAnalyze}
              className="group relative h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Match...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Analyze Resume
                  <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-sm font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" /> {errorMsg}
              </motion.div>
            )}
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
      `}</style>
    </div>
  );
};

export default UploadPage;