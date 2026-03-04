"use client";

import type { FC, JSX } from "react";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { processResume } from "@/app/actions/upload-resume";

interface ResumeAnalysis {
  ats_score: number;
  [key: string]: unknown;
}

interface UploadResultSuccess {
  success: true;
  data: ResumeAnalysis;
  scanId?: string; // Added in case you want to redirect to a specific scan page
}

interface UploadResultError {
  success: false;
  message: string;
  hint?: string;
}

type UploadResult = UploadResultSuccess | UploadResultError;

const UploadZone: FC = (): JSX.Element => {
  const router = useRouter();
  
  // Upload & UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Hidden file input reference (used for both click & drag-drop)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when a new file is selected
  const handleFileSelect = useCallback((file: File | null): void => {
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setHint(null);
    setAnalysis(null);
  }, []);

  // Handle drag & drop upload (PDF only)
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files[0];
      if (!file || file.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        return;
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // Submit resume and JD for AI processing
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError("Please upload your resume PDF.");
        return;
      }
      if (!jobDescription.trim()) {
        setError("Please paste the target Job Description.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setHint(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription); // Pass JD to your backend action

      try {
        const result = (await processResume(formData)) as UploadResult;

        if (!result.success) {
          setError(result.message);
          setHint(result.hint ?? null);
        } else {
          setAnalysis(result.data);
          // OPTIONAL: If your processResume returns a scanId, redirect the user:
          // if (result.scanId) router.push(`/dashboard/scan/${result.scanId}`);
        }
      } catch (err) {
        setError("A critical error occurred while analyzing the resume.");
      } finally {
        setIsLoading(false);
      }
    },
    [jobDescription, router]
  );

  return (
    <div className="mx-auto mt-12 max-w-5xl space-y-10">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* LEFT: Resume Upload Drag & Drop */}
          <div className="flex flex-col border border-slate-200 bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg"><FileText className="w-5 h-5 text-indigo-600" /></div>
              <h2 className="text-lg font-bold text-slate-800">1. Upload Resume</h2>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50"
                  : fileName
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />

              {fileName ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">Click or drag to change file</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-indigo-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Drag & drop PDF here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: JD Input */}
          <div className="flex flex-col border border-slate-200 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg"><Briefcase className="w-5 h-5 text-purple-600" /></div>
              <h2 className="text-lg font-bold text-slate-800">2. Target Job Description</h2>
            </div>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the exact job description here. Our AI will analyze your resume against these specific requirements..."
              className="flex-1 w-full p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none min-h-[250px]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isLoading || !fileName || !jobDescription.trim()}
            className="w-full md:w-auto min-w-[300px] rounded-xl bg-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
          >
            {isLoading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing & Scoring...</>
            ) : (
              <><Sparkles className="w-6 h-6" /> Start AI Analysis</>
            )}
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-red-800 animate-in fade-in slide-in-from-bottom-4">
          <strong className="mb-3 block text-xl flex items-center gap-2">
             Upload Failed
          </strong>
          <p className="text-md">{error}</p>

          {hint && (
            <div className="mt-6 rounded-xl border border-red-200 bg-white p-6 text-sm shadow-sm">
              <strong className="text-slate-800">How to fix:</strong>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600">
                <li>Open your resume in Word or Google Docs</li>
                <li>Export → PDF (avoid Print to PDF)</li>
                <li>Ensure the text is selectable</li>
                <li className="text-red-600">{hint}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success State (Temporary Raw JSON View) */}
      {analysis && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="mb-6 text-center text-3xl font-bold text-emerald-800 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            Analysis Complete!
          </h3>

          <div className="rounded-xl border border-emerald-100 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <span
                className={`inline-block rounded-full px-8 py-3 text-3xl font-bold text-white shadow-md ${
                  analysis.ats_score >= 80
                    ? "bg-emerald-500"
                    : analysis.ats_score >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              >
                ATS Score: {analysis.ats_score}/100
              </span>
            </div>

            {/* Raw analysis output */}
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-6 text-xs text-slate-600 font-mono border border-slate-200 max-h-[400px] overflow-y-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;