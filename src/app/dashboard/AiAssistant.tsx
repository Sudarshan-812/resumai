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
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative scroll-mt-20" id="ai-assistant">
      
      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Career Assistant</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-mono text-purple-400 uppercase">
          Gemini Powered
        </div>
      </div>

      <div className="p-6">
        
        {/* --- TABS --- */}
        <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('cover_letter'); setResult(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all",
              activeTab === 'cover_letter' 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
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
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Interview Prep
          </button>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Job Description Context
          </label>
          <textarea 
            placeholder="Paste the Job Description here (e.g. 'Senior React Developer at Netflix...')"
            className="w-full h-32 bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:border-purple-500/50 focus:bg-zinc-900/50 focus:outline-none transition-all resize-none"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* --- GENERATE BUTTON --- */}
        <div className="mt-6">
          <button 
            onClick={handleGenerate} 
            disabled={isPending || !jobDescription}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 group"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Generate {activeTab === 'cover_letter' ? 'Draft' : 'Questions'}
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* --- RESULTS DISPLAY --- */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Generated Output
              </span>
              <button
                className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                onClick={() => {
                  const textToCopy = activeTab === 'cover_letter' 
                    ? result 
                    : result.questions.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
                  copyToClipboard(textToCopy);
                }}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden max-h-[500px] overflow-y-auto p-6 shadow-inner">
              {activeTab === 'cover_letter' ? (
                <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans text-sm">
                  {result}
                </div>
              ) : (
                <div className="space-y-4">
                  {result.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-black/40 p-5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                      <div className="flex gap-3 mb-2">
                         <div className="mt-0.5"><HelpCircle className="w-4 h-4 text-purple-400" /></div>
                         <p className="font-semibold text-white text-sm">Q{i+1}: {q.question}</p>
                      </div>
                      <div className="pl-7 border-l-2 border-zinc-800 ml-2">
                         <p className="text-zinc-400 text-sm leading-relaxed italic">
                           " {q.answer} "
                         </p>
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