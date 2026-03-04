"use client";

import type { FC, JSX } from "react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
  X,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/components/theme-toggle";

const UploadPage: FC = (): JSX.Element => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Utility to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const kiloByte = 1024;
    const units = ["Bytes", "KB", "MB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(kiloByte));
    return `${(bytes / kiloByte ** unitIndex).toFixed(2)} ${units[unitIndex]}`;
  };

  // --- HANDLERS ---
  
  // FIX: Explicitly defined handleFileSelect
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMsg(null);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setErrorMsg("Only PDF files are supported.");
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
      throw new Error(result.message || "Analysis failed");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Analysis failed. Try again.");
      setIsUploading(false);
    }
  }, [file, jobDescription, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC] text-slate-900 transition-colors duration-300 dark:bg-[#0F172A] dark:text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20" 
           style={{ backgroundImage: 'linear-gradient(to right, #6366F1 1px, transparent 1px), linear-gradient(to bottom, #6366F1 1px, transparent 1px)', backgroundSize: '4rem 4rem' }} />
      
      {/* Navigation */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#6366F1] transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-20">
        <div className="w-full max-w-5xl">
          <div className="mb-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#6366F1]">
              <Sparkles className="h-3 w-3" /> Targeted JD Analysis
            </motion.div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl dark:text-white text-slate-900">
              Analyze Your Match.
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: PDF Upload */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all duration-300 backdrop-blur-md",
                isDragging ? "border-[#6366F1] bg-[#6366F1]/5 scale-[1.02]" : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40"
              )}>
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="mb-6 h-48 w-48 mx-auto">
                      <DotLottieReact src="https://lottie.host/55dd39b0-3065-47e4-bcdd-dc67673b3db5/ZGLhHRNwjr.lottie" loop autoplay />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Upload Resume PDF</h3>
                    <label className="cursor-pointer">
                      <span className="inline-block rounded-xl bg-[#6366F1] px-8 py-3.5 font-bold text-white shadow-lg hover:bg-[#4F46E5] transition-all">Select File</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".pdf" 
                        hidden 
                        onChange={handleFileSelect} 
                      />
                    </label>
                  </motion.div>
                ) : (
                  <motion.div key="file" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/10 text-[#6366F1]">
                      <FileText className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-lg mb-1">{file.name}</p>
                    <p className="text-xs text-slate-500 font-mono mb-6">{formatFileSize(file.size)}</p>
                    <button onClick={() => setFile(null)} className="text-xs font-bold text-red-500 hover:underline">Remove File</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* RIGHT: JD Input */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2 text-[#6366F1]">
                <Briefcase className="h-5 w-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Target Job Description</h3>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed placeholder:text-slate-500 resize-none min-h-[300px]"
              />
            </motion.div>
          </div>

          <div className="mt-12 flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={isUploading || !file || !jobDescription.trim()}
              onClick={handleAnalyze}
              className="group relative flex items-center gap-3 rounded-2xl bg-[#6366F1] px-12 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-[#4F46E5] disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="animate-pulse">Analyzing...</span>
                </>
              ) : (
                <>
                  Start AI Match Analysis
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </motion.button>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 text-sm font-bold text-red-500">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;