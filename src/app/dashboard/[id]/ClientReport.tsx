"use client";

import { useState, useEffect } from "react";
import AiAssistant from "@/app/dashboard/AiAssistant";
import DashboardNavbar from "../dashboard-navbar";
import { 
  Download, Bot, X, CheckCircle2, Target, 
  Clock, BarChart3, Shield, Zap, ChevronRight, FileSignature, 
  Mic, Sparkles, Copy, FileText, Check, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- ANIMATED SCORE RING ---
function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const r = 56, circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#f4f4f5" strokeWidth="8" />
          <circle 
            cx="64" cy="64" r={r} fill="none" stroke={color} 
            strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} 
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">{score}</span>
          <span className="text-[10px] font-semibold text-zinc-400 tracking-widest mt-0.5">/100</span>
        </div>
      </div>
      <span className="text-[12px] font-bold px-3 py-1 rounded-full border" 
            style={{ color: color, backgroundColor: `${color}10`, borderColor: `${color}25` }}>
        {label} Match
      </span>
    </div>
  );
}

// --- FLOATING AI CHAT PANEL ---
function FloatingChat({ onClose, resumeId }: { onClose: () => void, resumeId: string }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
      <div className="fixed top-4 right-4 bottom-4 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300 border border-zinc-200">
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">AI Copilot</h2>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Gemini 2.0
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
           <AiAssistant resumeId={resumeId} />
        </div>
      </div>
    </>
  );
}

export default function ClientReport({ resume, analysis }: { resume: any, analysis: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);

  // Feature UI States
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clGenerated, setClGenerated] = useState(false);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [prepGenerated, setPrepGenerated] = useState(false);

  const score = analysis.ats_score || 0;
  const skillsFound = analysis.skills_found || [];
  const missing = analysis.missing_keywords || [];
  const issues = analysis.formatting_issues || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. SHARED DASHBOARD NAVBAR */}
      <DashboardNavbar 
        userProfile={{
          name: "Developer", // Replace with real profile name
          email: "", 
          credits: 10, // Replace with real credits
          initial: "D"
        }}
        onSignOut={() => window.location.href = '/login'}
        isSigningOut={false}
      />

      {/* 2. MAIN CONTENT WITH pt-28 TO CLEAR FIXED NAVBAR */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 animate-in fade-in duration-700">
        
        {/* HERO SECTION */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Analysis Complete
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 mb-3 capitalize">{resume.file_name.replace('.pdf', '')}</h1>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
              {analysis.summary_feedback?.slice(0, 180)}...
            </p>
            <div className="flex gap-4 mt-6">
               <button className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200"><Download className="w-3.5 h-3.5"/> Export PDF</button>
               <button className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200"><Copy className="w-3.5 h-3.5"/> Copy Text</button>
            </div>
          </div>
          <div className="shrink-0 bg-zinc-50 p-6 rounded-3xl border border-zinc-100 shadow-inner flex items-center justify-center">
             <ScoreRing score={score} />
          </div>
        </div>

        {/* NAVIGATION & CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: MAIN WORKSPACE */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex overflow-x-auto hide-scrollbar bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-fit">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "keywords", label: "Keywords", icon: Target },
                { id: "cover-letter", label: "Cover Letter", icon: FileSignature },
                { id: "interview", label: "Mock Interview", icon: Mic },
              ].map(tab => (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-100"
                  )}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="min-h-[400px]">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Shield className="w-5 h-5 text-indigo-500" /> Parsing Audit</h3>
                    {issues.length > 0 ? (
                      <div className="space-y-3">
                        {issues.map((iss: string, i: number) => (
                          <div key={i} className="flex gap-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm leading-relaxed"><AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />{iss}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                        <p className="font-bold text-zinc-900 text-lg">No Formatting Errors</p>
                        <p className="text-sm text-zinc-500">Your resume layout is perfectly ATS-compliant.</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                     <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-zinc-900"><Sparkles className="w-5 h-5 text-amber-500" /> AI Executive Summary</h3>
                     <p className="text-zinc-600 leading-loose text-base">{analysis.summary_feedback}</p>
                  </div>
                </div>
              )}

              {activeTab === "keywords" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-400">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                       <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"/> Missing Gaps</h4>
                       <div className="flex flex-wrap gap-2.5">
                         {missing.map((k: string, i: number) => <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-black shadow-sm flex items-center gap-2"><Plus className="w-3 h-3 opacity-50"/>{k}</span>)}
                       </div>
                     </div>
                     <div>
                       <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Verified Skills</h4>
                       <div className="flex flex-wrap gap-2.5">
                         {skillsFound.map((s: string, i: number) => <span key={i} className="px-4 py-2 bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-black shadow-sm">{s}</span>)}
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {activeTab === "cover-letter" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                   {!clGenerated && !isGeneratingCL ? (
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-sm">
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner"><FileSignature className="w-10 h-10" /></div>
                      <h3 className="text-3xl font-serif font-bold text-zinc-900 mb-4">Tailored Cover Letter</h3>
                      <p className="text-zinc-500 mb-10 max-w-md leading-relaxed">Our AI will match your experience against the JD to draft a personalized letter that stands out.</p>
                      <button onClick={() => { setIsGeneratingCL(true); setTimeout(() => { setIsGeneratingCL(false); setClGenerated(true); }, 2000); }} 
                              className="bg-zinc-900 hover:bg-zinc-800 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all hover:scale-[1.02] shadow-2xl shadow-zinc-900/30">
                        <Sparkles className="w-5 h-5 text-indigo-400" /> Generate Draft
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-zinc-200 shadow-xl rounded-[2rem] overflow-hidden max-w-3xl mx-auto">
                       <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Generated Document</span>
                         <div className="flex gap-2">
                           <button className="text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-200 text-zinc-600 transition"><Copy className="w-3.5 h-3.5"/> Copy</button>
                           <button className="text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-200 text-zinc-600 transition"><Download className="w-3.5 h-3.5"/> PDF</button>
                         </div>
                       </div>
                       <div className="p-10 sm:p-16 font-serif text-zinc-800 text-base sm:text-lg leading-relaxed whitespace-pre-wrap animate-in fade-in duration-1000">
                         Dear Hiring Team,{"\n\n"}
                         I am excited to apply for this role... (Placeholder)
                       </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "interview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                   <div className="bg-zinc-900 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-2xl border border-zinc-800 text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl"><Mic className="w-10 h-10 text-emerald-400" /></div>
                      <h3 className="text-3xl font-serif font-bold mb-4">Mock Interview Prep</h3>
                      <p className="text-zinc-400 mb-10 max-w-md">Get custom-tailored questions based on your specific resume gaps.</p>
                      <button onClick={() => { setIsGeneratingPrep(true); setTimeout(() => { setIsGeneratingPrep(false); setPrepGenerated(true); }, 2000); }} 
                              className="bg-white hover:bg-emerald-50 text-zinc-900 px-10 py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02]">
                         Start Preparation
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: SIDEBAR TRIGGERS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div onClick={() => setChatOpen(true)} className="group cursor-pointer bg-white hover:border-indigo-300 rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm transition-all hover:-translate-y-1">
               <div className="flex items-center justify-between mb-8">
                 <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-900/20 group-hover:rotate-6 transition-transform"><Bot className="w-7 h-7"/></div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> AI Active</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Ready to rewrite</span>
                 </div>
               </div>
               <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Fix with AI Copilot</h3>
               <p className="text-sm text-zinc-500 leading-relaxed">Chat with Gemini to fix specific bullet points or optimize for keywords.</p>
               <div className="mt-8 flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest group-hover:gap-3 transition-all">Open Chat <ChevronRight className="w-4 h-4"/></div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm">
               <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">Expert Benchmarks</h4>
               <div className="space-y-2">
                  {[
                    { label: "Elite Match", range: "90+", active: score >= 90 },
                    { label: "Competitive", range: "75-89", active: score >= 75 && score < 90 },
                    { label: "Average", range: "60-74", active: score >= 60 && score < 75 },
                  ].map(b => (
                    <div key={b.label} className={cn("flex justify-between items-center p-3 rounded-xl border transition-all", b.active ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-transparent text-zinc-400")}>
                      <span className="text-xs font-bold">{b.label}</span>
                      <span className="font-mono text-xs font-black">{b.range}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* FLOATING CHAT COMPONENT */}
      {chatOpen && <FloatingChat onClose={() => setChatOpen(false)} resumeId={resume.id} />}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);