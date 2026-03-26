"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiAssistant from "@/app/dashboard/AiAssistant";
import DashboardNavbar from "../dashboard-navbar";
import { 
  Download, X, CheckCircle2, Target, 
  Copy, FileText, AlertCircle, 
  Activity, Terminal, Zap, ShieldCheck,
  BarChart3, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── HIGH-END TELEMETRY GAUGE ───
function ScoreGauge({ score }: { score: number }) {
  const [currentScore, setCurrentScore] = useState(0);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500 text-emerald-500";
    if (s >= 60) return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };
  const colors = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setCurrentScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (240 / 360) * circumference;
  const dashOffset = arcLength - (currentScore / 100) * arcLength;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 border border-border bg-card rounded-2xl shadow-sm">
      <div className="absolute top-0 inset-x-0 h-6 border-b border-border bg-muted/30 flex items-center justify-between px-3">
        <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Index_Match</span>
        <Activity size={10} className="text-muted-foreground/50" />
      </div>

      <div className="mt-4 relative w-32 h-32">
        <svg className="w-full h-full rotate-[150deg]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" className="text-muted/30" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="1 6" strokeDashoffset="0.5" className="text-background" />
          <motion.circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" initial={{ strokeDashoffset: arcLength }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className={cn(colors, "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.3)]")} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={cn("text-4xl font-bold font-mono tracking-tighter tabular-nums leading-none", colors.split(' ')[1])}>
            {currentScore}
          </motion.span>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING AI CHAT PANEL ───
function FloatingChat({ onClose, resumeId }: { onClose: () => void, resumeId: string }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]" />
      <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
        className="fixed top-4 right-4 bottom-4 w-full max-w-[420px] bg-card rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden border border-border"
      >
        <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">Neural Copilot</h2>
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gemini_Active
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col bg-background">
           <AiAssistant resumeId={resumeId} />
        </div>
      </motion.div>
    </>
  );
}

export default function ClientReport({ resume, analysis }: { resume: any, analysis: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);

  const score = analysis.ats_score || 0;
  const skillsFound = analysis.skills_found || [];
  const missing = analysis.missing_keywords || [];
  const issues = analysis.formatting_issues || [];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-24 selection:bg-primary/20 selection:text-primary">
      
      <DashboardNavbar 
        userProfile={{
          name: "Developer",
          email: "dev@example.com",
          credits: 10,
          initial: "D"
        }}
      />

      <main className="max-w-6xl mx-auto px-6 pt-24">
        
        {/* ─── HERO SECTION ─── */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Scan_Complete
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3 capitalize tracking-tight">
              {resume.file_name.replace('.pdf', '')}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              {analysis.summary_feedback?.slice(0, 180)}...
            </p>
            <div className="flex gap-3 mt-6">
               <button className="flex items-center gap-2 text-xs font-bold text-foreground hover:bg-muted transition-colors bg-background px-4 py-2 rounded-lg border border-border shadow-sm"><Download className="w-3.5 h-3.5"/> Export Data</button>
               <button className="flex items-center gap-2 text-xs font-bold text-foreground hover:bg-muted transition-colors bg-background px-4 py-2 rounded-lg border border-border shadow-sm"><Copy className="w-3.5 h-3.5"/> Copy Raw</button>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center">
             <ScoreGauge score={score} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ─── LEFT: MAIN WORKSPACE ─── */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex overflow-x-auto hide-scrollbar bg-muted/50 p-1 rounded-xl border border-border shadow-sm w-fit">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "keywords", label: "Keywords", icon: Target },
              ].map(tab => (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-background text-foreground shadow-sm border border-border/50" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="min-h-[400px]">
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-6">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Structural Integrity
                    </h3>
                    {issues.length > 0 ? (
                      <div className="space-y-3">
                        {issues.map((iss: string, i: number) => (
                          <div key={i} className="flex gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-sm leading-relaxed"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{iss}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                        <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Parsing Optimal</p>
                        <p className="text-xs text-muted-foreground mt-1">Architecture aligns perfectly with ATS parsers.</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                     <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
                       <Zap className="w-4 h-4 text-amber-500" /> Semantic Analysis
                     </h3>
                     <p className="text-muted-foreground leading-relaxed text-sm">{analysis.summary_feedback}</p>
                  </div>
                </motion.div>
              )}

              {/* ─── REFACTORED KEYWORDS TAB ─── */}
              {activeTab === "keywords" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     
                     {/* Missing Parameters (Fixed Height + Scroll) */}
                     <div className="flex flex-col">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"/> Missing Parameters
                         </h4>
                         <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{missing.length}</span>
                       </div>
                       
                       <div className="flex-1 border border-border/50 bg-muted/10 rounded-xl p-4 h-[320px] overflow-y-auto technical-scrollbar">
                         {missing.length > 0 ? (
                           <div className="flex flex-wrap gap-2 content-start">
                             {missing.map((k: string, i: number) => (
                               <span key={i} className="px-2.5 py-1.5 bg-background border border-border rounded-md text-[11px] font-mono text-foreground shadow-sm flex items-start gap-1.5 max-w-full">
                                 <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-[2px]"/>
                                 <span className="whitespace-normal leading-snug">{k}</span>
                               </span>
                             ))}
                           </div>
                         ) : (
                           <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">No missing parameters.</div>
                         )}
                       </div>
                     </div>

                     {/* Validated Nodes (Fixed Height + Scroll) */}
                     <div className="flex flex-col">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Validated Nodes
                         </h4>
                         <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{skillsFound.length}</span>
                       </div>
                       
                       <div className="flex-1 border border-border/50 bg-muted/10 rounded-xl p-4 h-[320px] overflow-y-auto technical-scrollbar">
                         {skillsFound.length > 0 ? (
                           <div className="flex flex-wrap gap-2 content-start">
                             {skillsFound.map((s: string, i: number) => (
                               <span key={i} className="px-2.5 py-1.5 bg-background border border-border rounded-md text-[11px] font-mono text-foreground shadow-sm flex items-start gap-1.5 max-w-full">
                                 <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-[2px]"/>
                                 <span className="whitespace-normal leading-snug">{s}</span>
                               </span>
                             ))}
                           </div>
                         ) : (
                           <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">No validated nodes.</div>
                         )}
                       </div>
                     </div>

                   </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: SIDEBAR TRIGGERS ─── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div onClick={() => setChatOpen(true)} className="group cursor-pointer bg-card hover:border-primary/50 rounded-2xl p-6 border border-border shadow-sm transition-all">
               <div className="flex items-center justify-between mb-6">
                 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm"><Terminal className="w-5 h-5"/></div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Engine Idle</span>
                 </div>
               </div>
               <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">Access Neural Copilot</h3>
               <p className="text-xs text-muted-foreground leading-relaxed">Open terminal to execute targeted rewrites and optimize bullet points.</p>
               <div className="mt-6 flex items-center gap-2 text-[10px] font-mono font-bold text-primary uppercase tracking-widest group-hover:gap-3 transition-all">
                  Execute <ChevronRight className="w-3.5 h-3.5"/>
               </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
               <h4 className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Performance Thresholds</h4>
               <div className="space-y-1">
                 {[
                   { label: "Elite Match", range: "90+", active: score >= 90 },
                   { label: "Competitive", range: "75-89", active: score >= 75 && score < 90 },
                   { label: "Average", range: "60-74", active: score >= 60 && score < 75 },
                 ].map(b => (
                   <div key={b.label} className={cn("flex justify-between items-center px-3 py-2.5 rounded-lg border text-xs transition-all", b.active ? "bg-muted/50 border-border font-bold text-foreground" : "border-transparent text-muted-foreground")}>
                     <span>{b.label}</span>
                     <span className="font-mono">{b.range}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </main>

      <AnimatePresence>
        {chatOpen && <FloatingChat onClose={() => setChatOpen(false)} resumeId={resume.id} />}
      </AnimatePresence>
      
      {/* Scrollbar styling for the keyword boxes */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .technical-scrollbar::-webkit-scrollbar { width: 4px; }
        .technical-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .technical-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
        .technical-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
      `}</style>
    </div>
  );
}