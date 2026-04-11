"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Loader2, CornerDownLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";

interface Props { resumeId: string; }

const GREETING_PAIRS = [
  ["Good to see you", "What would you like to improve today?"],
  ["Hello there", "Let's make your resume stand out."],
  ["Welcome back", "Your resume is loaded and ready to analyze."],
  ["Hi there", "Ask me anything about your resume."],
];

const SUGGESTIONS = [
  { label: "Rewrite my summary", prompt: "Rewrite my resume summary to be more impactful, metric-driven, and tailored to the job description." },
  { label: "Find missing keywords", prompt: "Which keywords from the job description are missing from my resume and where should I add them?" },
  { label: "Fix weak bullet points", prompt: "Identify the weakest bullet points in my experience section and suggest stronger alternatives using action verbs and metrics." },
  { label: "ATS compatibility check", prompt: "What formatting or structural changes should I make to improve ATS compatibility?" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

export default function AiAssistant({ resumeId }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [greetingIdx] = useState(() => Math.floor(Math.random() * GREETING_PAIRS.length));

  const chat: any = useChat({
    api: "/api/chat",
    body: { resumeId },
    onError: (err: any) => toast.error(err.message || "Something went wrong."),
  } as any);

  const { messages = [], input = "", setInput = () => {}, isLoading = false, handleSubmit } = chat;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "";
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const submitMessage = (e?: FormEvent, manual?: string) => {
    e?.preventDefault();
    const text = manual || input;
    if (!text.trim() || isLoading) return;

    if (manual) {
      setInput(manual);
      requestAnimationFrame(() => {
        if (typeof chat.append === "function") {
          chat.append({ role: "user", content: manual });
        }
      });
    } else {
      if (typeof chat.append === "function") {
        chat.append({ role: "user", content: input });
        setInput("");
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const greeting = GREETING_PAIRS[greetingIdx];
  const displayGreeting = userName ? `${greeting[0]}, ${userName}` : greeting[0];

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty state — Gemini-style greeting */
          <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-8">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight mb-1">
                {displayGreeting}
              </h3>
              <p className="text-sm text-muted-foreground">{greeting[1]}</p>
            </div>

            <div className="w-full max-w-sm grid grid-cols-2 gap-2 mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => submitMessage(undefined, s.prompt)}
                  className={cn(
                    "text-left px-3.5 py-3 rounded-xl border text-[12.5px] font-medium leading-snug transition-all",
                    "bg-card border-border hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/8 hover:shadow-sm text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-6 space-y-6">
            {messages.map((m: any) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  m.role === "user"
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                    : "bg-blue-600 text-white"
                )}>
                  {m.role === "user" ? (userName?.[0]?.toUpperCase() ?? "U") : <Sparkles size={12} />}
                </div>

                {/* Message */}
                <div className={cn(
                  "max-w-[82%] text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-muted/60 border border-border rounded-2xl rounded-tr-sm px-4 py-3 text-foreground"
                    : "text-foreground rounded-2xl rounded-tl-sm"
                )}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                      {m.content.split("\n").map((line: string, i: number) => (
                        <p key={i} className={cn(!line.trim() && "h-2")}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="bg-muted/40 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-border bg-background shrink-0">
        <form onSubmit={submitMessage} className="relative">
          <textarea
            ref={inputRef}
            value={input || ""}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your resume…"
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border border-border bg-muted/30 px-4 py-3 pr-12 text-sm text-foreground",
              "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40",
              "transition-all disabled:opacity-50 leading-relaxed",
            )}
            style={{ minHeight: 48, maxHeight: 160 }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <button
            type="submit"
            disabled={!input?.trim() || isLoading}
            className={cn(
              "absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
              input?.trim() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
          </button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
          Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
