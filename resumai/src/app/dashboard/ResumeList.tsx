// src/components/dashboard/ResumeList.tsx
import React from "react";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

type Analysis = {
  ats_score?: number | null;
  summary_feedback?: string | null;
};

type ResumeItem = {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Analysis[] | null;
};

export default function ResumeList({ resumes }: { resumes: ResumeItem[] | any[] }) {
  if (!resumes || resumes.length === 0) {
    return (
      <div className="text-center p-10 border-2 border-dashed rounded-xl bg-slate-50">
        <p className="text-slate-500">No resumes found. Upload one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {resumes.map((resume: ResumeItem) => {
        const analysis = (resume.analyses && resume.analyses[0]) || null;
        const score = typeof analysis?.ats_score === "number" ? analysis.ats_score : 0;

        const scoreBg = score > 70 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600";
        const scoreText = score > 70 ? "text-green-600" : "text-orange-500";

        return (
          <Link
            key={resume.id}
            href={`/dashboard/${resume.id}`}
            className="group"
            prefetch={false}
          >
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group-hover:border-blue-200">
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${scoreBg}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{resume.file_name || "Untitled"}</h3>
                  <p className="text-xs text-slate-500">
                    {resume.created_at ? new Date(resume.created_at).toLocaleString() : "Unknown date"}
                  </p>
                </div>
              </div>

              {/* Middle: Score */}
              <div className="text-right mr-6">
                <span className={`text-2xl font-bold ${scoreText}`}>
                  {score}
                </span>
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Score</span>
              </div>

              {/* Right: Arrow */}
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
