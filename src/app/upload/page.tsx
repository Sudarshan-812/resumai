"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Loader2, ArrowLeft, AlertCircle, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { processResume } from "@/app/actions/upload-resume";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/components/theme-toggle";
// 👇 Import Framer Motion for animations
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- HELPER: FORMAT FILE SIZE (KB/MB) ---
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMsg(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        setErrorMsg("Only PDF files are supported.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await processResume(formData);

      if (result.success && result.id) {
        router.push(`/dashboard/${result.id}`);
      } else {
        throw new Error(result.message || "Analysis failed");
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMsg(error.message || "Something went wrong. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300 relative flex flex-col overflow-hidden">
      
      {/* Background Grid */}
      <div className={cn(
        "absolute inset-0 pointer-events-none z-0",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
      )} />
      <div className="absolute inset-0 z-0 bg-white/50 dark:bg-black/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* --- NAVBAR --- */}
      <div className="relative z-50 flex items-center justify-between px-6 sm:px-8 py-6">
        <Link 
          href="/dashboard" 
          className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>

      {/* --- MAIN CONTENT (Animated) --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 -mt-20">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-3 h-3" />
              AI Powered Analysis
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-zinc-900 dark:text-white">
              Upload your Resume
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Get an instant ATS score and detailed feedback in seconds.
            </p>
          </div>

          {/* ANIMATED UPLOAD BOX */}
          <motion.div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={cn(
              "relative group border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm",
              isDragging 
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]" 
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl dark:hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
            )}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                // STATE 1: NO FILE
                <motion.div 
                  key="upload-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
                    Drag & Drop your PDF
                  </h3>
                  <p className="text-zinc-500 mb-8 text-sm">or click to browse from your computer</p>
                  
                  <label className="cursor-pointer">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Select PDF
                    </motion.span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      onChange={handleFileSelect}
                    />
                  </label>
                </motion.div>
              ) : (
                // STATE 2: FILE SELECTED
                <motion.div 
                  key="file-selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4"
                  >
                    <FileText className="w-8 h-8" />
                  </motion.div>
                  
                  <div className="text-center mb-8">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                      {file.name}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setFile(null); setErrorMsg(null); }}
                      disabled={isUploading}
                      className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-bold text-zinc-600 dark:text-zinc-300 disabled:opacity-50"
                    >
                      Change File
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAnalyze}
                      disabled={isUploading}
                      className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg hover:shadow-indigo-500/25 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Start AI Scan
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ERROR MESSAGE */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="ml-auto hover:text-red-800 dark:hover:text-red-200">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}