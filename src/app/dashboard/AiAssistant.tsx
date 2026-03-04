"use client";

import { useEffect, useRef, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
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
    onError: (err: any) => toast.error(err.message || "Failed to send message.")
  } as any);

  // SAFE DESTRUCTURING: 
  // We set default values (like = '') to prevent "undefined" runtime errors.
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
    
    // Ensure we have a string to work with, even if input is weirdly null
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
      toast.error("Could not send message.");
    }
  };

  const handleQuickPrompt = (text: string) => {
    handleSendMessage(undefined, text);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">How can I help?</h3>
            <p className="text-sm text-zinc-500 max-w-[250px] mb-8 leading-relaxed">
              I can rewrite your bullet points, analyze missing skills, or help you tailor your experience.
            </p>
            
            <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
              {["Rewrite my summary to be more punchy", "How do I add the missing keywords?", "Fix my formatting issues"].map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200 py-3 px-4 rounded-xl transition-colors text-left shadow-sm"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m: any) => (
            <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'user' ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "px-4 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm",
                m.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm" 
                  : "bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm whitespace-pre-wrap"
              )}>
                {m.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
        <form 
          onSubmit={handleSendMessage} 
          className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl focus-within:border-zinc-400 focus-within:bg-white transition-colors shadow-sm overflow-hidden"
        >
          <input
            value={input || ''} // Safety fallback
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot..."
            disabled={isLoading}
            className="w-full bg-transparent pl-4 pr-12 py-3.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
          />
          <button 
            type="submit" 
            // FIXED: Added optional chaining and empty string check
            disabled={!(input?.trim()) || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5 -ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">
            AI can make mistakes. Review generated text.
          </p>
        </div>
      </div>
    </div>
  );
}