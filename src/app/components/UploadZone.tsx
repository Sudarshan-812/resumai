"use client";

import type { FC, JSX } from "react";
import { useState, useRef, useCallback } from "react";
import { processResume } from "@/app/actions/upload-resume";

interface ResumeAnalysis {
  ats_score: number;
  [key: string]: unknown;
}

interface UploadResultSuccess {
  success: true;
  data: ResumeAnalysis;
}

interface UploadResultError {
  success: false;
  message: string;
  hint?: string;
}

type UploadResult = UploadResultSuccess | UploadResultError;

const UploadZone: FC = (): JSX.Element => {
  // Upload & UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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

  // Submit resume for AI processing
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setHint(null);

      const formData = new FormData();
      formData.append("file", file);

      const result = (await processResume(formData)) as UploadResult;

      if (!result.success) {
        setError(result.message);
        setHint(result.hint ?? null);
      } else {
        setAnalysis(result.data);
      }

      setIsLoading(false);
    },
    []
  );

  return (
    <div className="mx-auto mt-12 max-w-4xl space-y-10">
      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-10 shadow-xl"
      >
        <h2 className="mb-8 text-center text-3xl font-bold">
          AI Resume Analyzer
        </h2>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-4 border-dashed p-16 text-center transition-all ${
            isDragOver
              ? "border-black bg-gray-50"
              : "border-gray-300"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            required
            hidden
            onChange={(e) =>
              handleFileSelect(e.target.files?.[0] ?? null)
            }
          />

          <p className="text-xl text-gray-700">
            Drag & drop your resume here
          </p>
          <p className="mt-2 text-sm text-gray-500">or</p>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            Choose PDF File
          </button>

          {fileName && (
            <p className="mt-6 text-lg font-medium text-gray-700">
              Selected:{" "}
              <span className="text-black">{fileName}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-10 text-center">
          <button
            type="submit"
            disabled={isLoading || !fileName}
            className="rounded-xl bg-black px-10 py-5 text-xl font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Start AI Analysis"}
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8 text-red-800">
          <strong className="mb-3 block text-xl">
            Upload Failed
          </strong>
          <p className="text-lg">{error}</p>

          {hint && (
            <div className="mt-6 rounded-xl border border-orange-300 bg-orange-100 p-6 text-sm">
              <strong>How to fix:</strong>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Open your resume in Word or Google Docs</li>
                <li>Export → PDF (avoid Print to PDF)</li>
                <li>Ensure the text is selectable</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {analysis && (
        <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-10">
          <h3 className="mb-6 text-center text-3xl font-bold text-green-800">
            Analysis Complete!
          </h3>

          <div className="rounded-xl border bg-white p-8 shadow-inner">
            <div className="mb-6 text-center">
              <span
                className={`inline-block rounded-full px-8 py-4 text-4xl font-bold text-white ${
                  analysis.ats_score >= 80
                    ? "bg-green-500"
                    : analysis.ats_score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                ATS Score: {analysis.ats_score}/100
              </span>
            </div>

            {/* Raw analysis output (temporary – useful during early product stage) */}
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-6 text-sm font-mono">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
