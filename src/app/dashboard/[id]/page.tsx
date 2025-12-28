import { createClient } from "@/app/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, BarChart3, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import AiAssistant from "@/app/dashboard/AiAssistant";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Metadata } from "next";
import PrintButton from "@/app/dashboard/PrintButton";
import ScoreGauge from "@/app/dashboard/ScoreGauge";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("resumes").select("file_name").eq("id", id).single();
  return {
    title: data?.file_name ? `${data.file_name} Analysis` : "Resume Report",
  };
}

export default async function ResumeReport({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const [resumeRes, analysisRes] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("analyses").select("*").eq("resume_id", id).single()
  ]);

  const resume = resumeRes.data;
  const analysis = analysisRes.data;

  if (!resume) return notFound();
  
  // Loading State (Light Theme)
  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-16 w-full bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-40 col-span-1 bg-slate-200" />
          <Skeleton className="h-40 col-span-3 bg-slate-200" />
        </div>
        <Skeleton className="h-64 w-full bg-slate-200" />
      </div>
    );
  }

  const score = analysis.ats_score || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
          .bg-slate-50 { background: white !important; }
          * { border-color: #ddd !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.4] no-print" 
           style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Sticky Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition group">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <PrintButton /> 
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Report Header */}
        <div className="mb-8 sm:mb-10 border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Analysis Report</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{resume.file_name}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
             <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Analysis Complete
             </span>
             <span className="flex items-center gap-1.5">
               <Calendar className="w-4 h-4 text-slate-400" />
               {new Date(resume.created_at).toLocaleDateString()}
             </span>
          </div>
        </div>

        {/* Top Row: Score & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          
          {/* Score Gauge Card */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
             <ScoreGauge score={score} />
          </div>

          {/* Stats Cards */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              value={analysis.skills_found?.length || 0}
              label="Skills Matched"
              color="text-emerald-700"
              bgColor="bg-emerald-50"
              borderColor="hover:border-emerald-200"
            />
            <StatCard 
              icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
              value={analysis.formatting_issues?.length || 0}
              label="Critical Issues"
              color="text-rose-700"
              bgColor="bg-rose-50"
              borderColor="hover:border-rose-200"
            />
            <StatCard 
              icon={<BarChart3 className="w-6 h-6 text-amber-600" />}
              value={analysis.missing_keywords?.length || 0}
              label="Missing Keywords"
              color="text-amber-700"
              bgColor="bg-amber-50"
              borderColor="hover:border-amber-200"
            />
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="mb-12 no-print">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
                <AiAssistant resumeId={id} />
            </div>
        </div>

        {/* Detailed Analysis Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Summary & Issues */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Executive Summary */}
            <div className="break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"/> Executive Summary
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 leading-relaxed text-slate-700 shadow-sm text-base">
                {analysis.summary_feedback || "No summary generated yet."}
              </div>
            </div>

            {/* Action Items */}
            <div className="break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-rose-500 rounded-full"/> Fix These Issues
              </h3>
              <div className="space-y-3">
                {(analysis.formatting_issues || []).length > 0 ? (
                  analysis.formatting_issues.map((issue: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-rose-200 hover:shadow-sm transition-all group">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm pt-1.5">{issue}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-700 font-medium">Perfect! No critical formatting issues found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Skills & Keywords */}
          <div className="space-y-8 break-inside-avoid">
            
            {/* Skills Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detected Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills_found?.length > 0 ? analysis.skills_found.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium">
                    {s}
                  </span>
                )) : <p className="text-slate-500 text-sm italic">No specific skills detected.</p>}
              </div>
            </div>

            {/* Missing Keywords Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recommended Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords?.length > 0 ? analysis.missing_keywords.map((k: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-sm font-medium flex items-center gap-1">
                    <PlusIcon className="w-3 h-3 opacity-50" /> {k}
                  </span>
                )) : <p className="text-emerald-600 text-sm font-medium">Great job! Your resume is well-optimized.</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ icon, value, label, borderColor, bgColor, color }: any) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-md group", borderColor)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105", bgColor)}>
         {icon}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
        <p className={cn("text-xs font-bold uppercase tracking-wider mt-1", color)}>{label}</p>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
    )
}