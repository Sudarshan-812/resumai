import { createClient } from "@/app/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Share2, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
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
  
  if (!analysis) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-40 col-span-1" />
          <Skeleton className="h-40 col-span-3" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const score = analysis.ats_score || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-700 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
          .bg-zinc-950 { background: white !important; }
          * { border-color: #ddd !important; }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] no-print" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-sm font-medium">Back</span>
            <span className="sm:hidden text-sm font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <PrintButton /> 
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-8 sm:mb-10 border-b border-white/5 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight truncate pr-4">{resume.file_name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
             <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Processed Successfully
             </span>
             <span className="hidden sm:inline">•</span>
             <span>{new Date(resume.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Top Row: Responsive Grid (1 Col Mobile, 4 Col Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          
          <div className="md:col-span-1 bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
             <ScoreGauge score={score} />
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              value={analysis.skills_found?.length || 0}
              label="Skills Matched"
              borderColor="hover:border-emerald-500/30"
              bgIcon="bg-emerald-500/10"
            />
            <StatCard 
              icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
              value={analysis.formatting_issues?.length || 0}
              label="Critical Issues"
              borderColor="hover:border-rose-500/30"
              bgIcon="bg-rose-500/10"
            />
            <StatCard 
              icon={<BarChart3 className="w-5 h-5 text-amber-500" />}
              value={analysis.missing_keywords?.length || 0}
              label="Missing Keywords"
              borderColor="hover:border-amber-500/30"
              bgIcon="bg-amber-500/10"
            />
          </div>
        </div>

        <div className="mb-12 no-print">
           <AiAssistant resumeId={id} />
        </div>

        {/* Bottom Split (Stacks on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="break-inside-avoid">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Analysis Summary</h3>
              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 sm:p-8 leading-relaxed text-zinc-300 shadow-inner text-sm sm:text-base">
                {analysis.summary_feedback || "No summary generated yet."}
              </div>
            </div>

            <div className="break-inside-avoid">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Action Items</h3>
              <div className="space-y-3">
                {(analysis.formatting_issues || []).length > 0 ? (
                  analysis.formatting_issues.map((issue: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:border-rose-500/20 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-300 leading-relaxed">{issue}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm text-emerald-400 font-medium">No critical issues found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8 break-inside-avoid">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Skills Detected</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills_found?.length > 0 ? analysis.skills_found.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium">
                    {s}
                  </span>
                )) : <p className="text-zinc-600 text-sm">None detected</p>}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords?.length > 0 ? analysis.missing_keywords.map((k: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium">
                    {k}
                  </span>
                )) : <p className="text-emerald-400 text-sm">All good!</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, value, label, borderColor, bgIcon }: any) {
  return (
    <div className={cn("bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between transition-colors group", borderColor)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", bgIcon)}>
         {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}