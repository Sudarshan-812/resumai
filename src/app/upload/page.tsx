"use client";

import type { FC, JSX } from "react";
import { useState, useCallback } from "react";
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
} from "lucide-react";

import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/components/theme-toggle";

const UploadPage: FC = (): JSX.Element => {
  const router = useRouter();

  // Drag & drop + file state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  // Upload / error state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Converts raw bytes into a readable format (KB / MB)
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const kiloByte = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(kiloByte));

    return `${(bytes / kiloByte ** unitIndex).toFixed(2)} ${
      units[unitIndex]
    }`;
  }, []);

  // Handles drag enter / leave / over events
  const handleDrag = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      if (event.type === "dragenter" || event.type === "dragover") {
        setIsDragging(true);
      } else if (event.type === "dragleave") {
        setIsDragging(false);
      }
    },
    []
  );

  // Handles file drop (PDF only)
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);
      setErrorMsg(null);

      const droppedFile = event.dataTransfer.files?.[0];
      if (!droppedFile) return;

      if (droppedFile.type !== "application/pdf") {
        setErrorMsg("Only PDF files are supported.");
        return;
      }

      setFile(droppedFile);
    },
    []
  );

  // Handles manual file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setErrorMsg(null);
      const selectedFile = event.target.files?.[0];
      if (selectedFile) setFile(selectedFile);
    },
    []
  );

  // Sends file to backend for AI analysis
  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await processResume(formData);

      // Backend returns a resumeId on success
      if (result.success && result.id) {
        router.push(`/dashboard/${result.id}`);
        return;
      }

      throw new Error(result.message || "Analysis failed");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setErrorMsg(message);
      setIsUploading(false);
    }
  }, [file, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gray-50 text-zinc-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-white">
      {/* Background grid (purely decorative) */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-white/50 dark:bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
      />

      {/* Top navigation */}
      <div className="relative z-50 flex items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>

      {/* Main upload section */}
      <div className="relative z-10 -mt-20 flex flex-1 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
            >
              <Sparkles className="h-3 w-3" />
              AI Powered Analysis
            </motion.div>

            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Upload your Resume
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Get an instant ATS score and detailed feedback in seconds.
            </p>
          </div>

          {/* Upload box */}
          <motion.div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={cn(
              "group relative rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 backdrop-blur-sm",
              "bg-white/50 dark:bg-zinc-900/30",
              isDragging
                ? "scale-[1.02] border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                : "border-zinc-200 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
            )}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                // --- STATE 1: No file selected ---
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {/* Default Upload Animation */}
                  <div className="mb-6 h-56 w-56 flex items-center justify-center transition-transform group-hover:scale-110">
                    <DotLottieReact
                      src="https://lottie.host/55dd39b0-3065-47e4-bcdd-dc67673b3db5/ZGLhHRNwjr.lottie"
                      loop
                      autoplay
                      className="h-full w-full"
                    />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">
                    Drag & Drop your PDF
                  </h3>
                  <p className="mb-8 text-sm text-zinc-500">
                    or click to browse from your computer
                  </p>

                  <label className="cursor-pointer">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block rounded-xl bg-zinc-900 px-8 py-3.5 font-bold text-white shadow-lg transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      Select PDF
                    </motion.span>
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleFileSelect}
                    />
                  </label>
                </motion.div>
              ) : (
                // --- STATE 2: File selected ---
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  
                  {/* --- CONDITIONAL ICON: Static vs Scanning --- */}
                  {isUploading ? (
                     // Scanning Animation
                     // Container size is fixed (h-56 w-56)
                     // Animation is Scaled up (scale-[1.8]) to look huge
                     <div className="mb-6 h-56 w-56 flex items-center justify-center">
                        <DotLottieReact
                          src="https://lottie.host/95dd5060-456e-45ec-97ab-b025f0b4e953/tPZIqhIzkt.lottie"
                          loop
                          autoplay
                          className="h-full w-full scale-[1.8]" 
                        />
                     </div>
                  ) : (
                    // Static PDF Icon
                    <motion.div
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"
                    >
                      <FileText className="h-8 w-8" />
                    </motion.div>
                  )}

                  <div className="mb-8 text-center">
                    <p className="mb-1 text-lg font-semibold">
                      {isUploading ? "Scanning Document..." : file.name}
                    </p>
                    <p className="inline-block rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-500 dark:bg-zinc-800">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isUploading}
                      onClick={() => {
                        setFile(null);
                        setErrorMsg(null);
                      }}
                      className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Change File
                    </motion.button>

                    {/* BLACK BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isUploading}
                      onClick={handleAnalyze}
                      className="flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-zinc-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Start AI Scan
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="ml-auto transition-colors hover:text-red-800 dark:hover:text-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;