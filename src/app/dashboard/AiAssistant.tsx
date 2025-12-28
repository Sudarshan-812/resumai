"use client";

import { useState, useTransition } from 'react';
import { generateCareerDoc } from '@/app/actions/ai-features';
import { 
  Loader2, Briefcase, Sparkles, Copy, Check, 
  PenTool, MessageSquare, ChevronRight, HelpCircle 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface JobAssistantProps {
  resumeId: string;
}

export default function AiAssistant({ resumeId }: JobAssistantProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'interview_prep'>('cover_letter');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!jobDescription) {
      toast.error("Please paste a Job Description first.");
      return;
    }
    
    setResult(null); 
    
    startTransition(async () => {
      try {
        const data = await generateCareerDoc(resumeId, jobDescription, activeTab);
        
        if (!data) {
          throw new Error("No data received from AI.");
        }

        setResult(data);
        toast.success("Content generated successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to generate content. Please try again.");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm relative scroll-mt-20" id="ai-assistant">
      
      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-md">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Career Assistant</h2>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 uppercase tracking-wider">
            Gemini Powered
          </span>
        </div>
      </div>

      <div className="p-6">
        
        {/* --- TABS --- */}
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('cover_letter'); setResult(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all",
              activeTab === 'cover_letter' 
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            Cover Letter
          </button>
          <button
            onClick={() => { setActiveTab('interview_prep'); setResult(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all",
              activeTab === 'interview_prep' 
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Interview Prep
          </button>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Job Description Context
          </label>
          <div className="relative group">
            <textarea 
                placeholder="Paste the Job Description here (e.g. 'Senior React Developer at Netflix...')"
                className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none shadow-sm group-hover:border-slate-300"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        {/* --- GENERATE BUTTON --- */}
        <div className="mt-6">
          <button 
            onClick={handleGenerate} 
            disabled={isPending || !jobDescription}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-indigo-500/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white/80" />
                Processing...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Generate {activeTab === 'cover_letter' ? 'Draft' : 'Questions'}
                <ChevronRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* --- RESULTS DISPLAY --- */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Generated Output
              </span>
              <button
                className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors bg-slate-50 px-2 py-1 rounded-md border border-slate-200 hover:border-indigo-200"
                onClick={() => {
                  const textToCopy = activeTab === 'cover_letter' 
                    ? result 
                    : result.questions.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
                  copyToClipboard(textToCopy);
                }}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Text"}
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden max-h-[500px] overflow-y-auto p-6 shadow-inner">
              {activeTab === 'cover_letter' ? (
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans text-sm">
                  {result}
                </div>
              ) : (
                <div className="space-y-4">
                  {result.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex gap-3 mb-2">
                          <div className="mt-0.5 p-1 bg-purple-50 rounded-md"><HelpCircle className="w-4 h-4 text-purple-600" /></div>
                          <p className="font-bold text-slate-800 text-sm">Q{i+1}: {q.question}</p>
                      </div>
                      <div className="pl-9">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed italic">
                            "{q.answer}"
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}