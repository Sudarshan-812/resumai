// app/components/UploadZone.tsx
"use client";
import React, { useState, useRef } from "react";
import { processResume } from "@/app/actions/upload-resume";

export default function UploadZone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setFilename(file.name);
      setError(null);
      setHint(null);
      setAnalysis(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      handleFileSelect(file);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);

    const result = await processResume(formData);

    if (!result.success) {
      setError(result.message);
      setHint((result as any).hint || null);
    } else {
      setAnalysis(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-10">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-xl border">
        <h2 className="text-3xl font-bold text-center mb-8">AI Resume Analyzer</h2>

        <div
          className={`border-4 border-dashed rounded-2xl p-16 text-center transition-all ${isDragOver ? "border-black bg-gray-50" : "border-gray-300"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" required className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
          <p className="text-xl text-gray-700">Drag & drop your resume here</p>
          <p className="text-sm text-gray-500 mt-2">or</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="mt-6 px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
            Choose PDF File
          </button>
          {filename && <p className="mt-6 text-lg font-medium text-gray-700">Selected: <span className="text-black">{filename}</span></p>}
        </div>

        <div className="mt-10 text-center">
          <button type="submit" disabled={loading || !filename} className="px-10 py-5 bg-black text-white text-xl font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "Analyzing..." : "Start AI Analysis"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-8 bg-red-50 border-2 border-red-300 rounded-2xl text-red-800">
          <strong className="text-xl block mb-3">Upload Failed</strong>
          <p className="text-lg">{error}</p>
          {hint && (
            <div className="mt-6 p-6 bg-orange-100 border border-orange-300 rounded-xl text-sm">
              <strong>How to fix:</strong>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Open your resume in Word/Google Docs</li>
                <li>Export → PDF (not Print to PDF)</li>
                <li>Ensure text is selectable</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className="p-10 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl">
          <h3 className="text-3xl font-bold text-green-800 mb-6 text-center">Analysis Complete!</h3>
          <div className="bg-white p-8 rounded-xl shadow-inner border">
            <div className="text-center mb-6">
              <span className={`inline-block px-8 py-4 rounded-full text-white text-4xl font-bold ${analysis.ats_score >= 80 ? "bg-green-500" : analysis.ats_score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}>
                ATS Score: {analysis.ats_score}/100
              </span>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 p-6 rounded-lg">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}