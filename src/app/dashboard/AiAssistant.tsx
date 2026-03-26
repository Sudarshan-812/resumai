"use client";

import { useEffect, useRef, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, Send, User, Terminal, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface JobAssistantProps {
  resumeId: string;
}

export default function AiAssistant({ resumeId }: JobAssistantProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat: any = useChat({
    api: '/api/chat',
    body: { resumeId },
    onError: (err: any) => toast.error(err.message || "Failed to execute command.")
  } as any);

  const { 
    messages = [], 
    input = '', 
    setInput = () => {}, 
    isLoading = false 
  } = chat;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: FormEvent, manualText?: string) => {
    e?.preventDefault();
    
    const textToSend = manualText || input || '';
    if (!textToSend.trim() || isLoading) return;

    try {
      if (typeof chat.append === 'function') {
        await chat.append({ role: 'user', content: textToSend });
      } else if (typeof chat.handleSubmit === 'function') {
        chat.handleSubmit(e);
      } else {
        setInput(textToSend);
        setTimeout(() => chat.handleSubmit?.(), 50);
      }
      
      if (!manualText) setInput('');
    } catch (err) {
      console.error("Chat submission error:", err);
      toast.error("Pipeline communication failure.");
    }
  };

  const handleQuickPrompt = (text: string) => {
    handleSendMessage(undefined, text);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      
      {/* ─── MESSAGES AREA ─── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Neural Interface Ready</h3>
            <p className="text-xs text-muted-foreground max-w-[260px] mb-8 leading-relaxed">
              Execute commands below or type natural language to manipulate your resume data, extract keywords, and rewrite bullets.
            </p>
            
            <div className="flex flex-col gap-2 w-full max-w-[300px]">
              {[
                { cmd: "/rewrite_summary", desc: "Make it more punchy and metric-driven" },
                { cmd: "/inject_keywords", desc: "How do I add the missing JD skills?" },
                { cmd: "/audit_format", desc: "Fix my structural formatting issues" }
              ].map((prompt) => (
                <button 
                  key={prompt.cmd}
                  onClick={() => handleQuickPrompt(prompt.desc)}
                  className="group flex flex-col items-start gap-1 bg-card hover:bg-muted border border-border py-3 px-4 rounded-xl transition-all text-left shadow-sm hover:border-primary/30"
                >
                  <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1.5">
                     <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"/> {prompt.cmd}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground pl-4.5">
                    {prompt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m: any) => (
            <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border",
                m.role === 'user' 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "bg-muted border-border text-foreground"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm",
                m.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-xl rounded-tr-sm" 
                  : "bg-muted/40 border border-border text-foreground rounded-xl rounded-tl-sm whitespace-pre-wrap"
              )}>
                {m.content}
              </div>
            </div>
          ))
        )}
        
        {/* Processing State */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 shadow-sm">
              <Terminal className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-muted/40 border border-border rounded-xl rounded-tl-sm px-5 py-4 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── INPUT AREA ─── */}
      <div className="p-4 bg-background border-t border-border shrink-0">
        <form 
          onSubmit={handleSendMessage} 
          className="relative flex items-center bg-muted/20 border border-border rounded-xl focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm overflow-hidden"
        >
          <div className="absolute left-3 text-muted-foreground/50">
            <ChevronRight className="w-4 h-4" />
          </div>
          <input
            value={input || ''} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or question..."
            disabled={isLoading}
            className="w-full bg-transparent pl-9 pr-12 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!(input?.trim()) || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-30 transition-all shadow-sm active:scale-[0.95]"
          >
            <Send className="w-3.5 h-3.5 -ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-[0.2em] leading-none">
            Gemini outputs may require human verification.
          </p>
        </div>
      </div>
    </div>
  );
}