"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";
import ResumeList from "@/app/dashboard/ResumeList";
import { Button } from "@/components/ui/button";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
  analyses?: Array<{ ats_score?: number | null }> | null;
}

export default function ResumesClient({ resumes }: { resumes: Resume[] }) {
  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Resumes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <Link href="/upload">
            <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
              <UploadCloud size={14} className="mr-1.5" />
              New Analysis
            </Button>
          </Link>
        </div>
        <ResumeList resumes={resumes} />
      </div>
    </DashboardShell>
  );
}
