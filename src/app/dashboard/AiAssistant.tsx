"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { Send, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  resumeId: string;
  onLoadingChange?: (loading: boolean) => void;
  onResponse?: (content: string) => void;
  latexCode?: string;
  onLatexChange?: (code: string) => void;
}

const SUGGESTIONS = [
  {
    label: "Rewrite my summary",
    prompt:
      "Rewrite my professional summary. Show the BEFORE version, then write a stronger AFTER version — metric-driven, specific, and tailored to the job description.",
  },
  {
    label: "Fix my weakest bullets",
    prompt:
      "Find my 3 weakest experience bullets. For each, show BEFORE → AFTER using strong action verbs and specific metrics in STAR format.",
  },
  {
    label: "Add missing keywords",
    prompt:
      "List the top 5 missing keywords from my resume. For each, tell me exactly WHERE and HOW to add it naturally.",
  },
  {
    label: "Full ATS audit",
    prompt:
      "Do a full ATS audit: formatting, keyword density, section headers, bullet structure. Give me a prioritized action checklist.",
  },
];

function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);
  return ref;
}

export default function AiAssistant({ resumeId, onLoadingChange, onResponse, latexCode, onLatexChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useAutoResizeTextarea(input);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name =
        user.user_metadata?.full_name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "";
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };
    setMessages([...allMsgs, assistantMsg]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMsgs.map((m) => ({ role: m.role, content: m.content })),
          resumeId,
          latexCode: latexCode || null,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m))
          );
        }
      }

      onResponse?.(full);

      // Extract a ```latex ... ``` block from the response and propagate it
      if (onLatexChange) {
        const latexMatch = full.match(/```latex\n?([\s\S]*?)```/);
        if (latexMatch) {
          onLatexChange(latexMatch[1].trim());
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      toast.error(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full px-6 pb-8 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                {userName
                  ? `How can I help, ${userName}?`
                  : "How can I help with your resume?"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ask me anything — I have your full resume in front of me.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt)}
                  className={cn(
                    "text-left p-4 rounded-2xl border text-[12.5px] font-medium leading-snug transition-all",
                    "border-border bg-card hover:bg-muted text-foreground hover:border-foreground/20"
                  )}
                >
                  <span className="line-clamp-2">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message thread ── */
          <div className="px-4 sm:px-8 py-6 space-y-8 max-w-3xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id}>
                {m.role === "user" ? (
                  /* User message — pill style */
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-muted rounded-3xl px-5 py-3 text-sm text-foreground leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant message — clean text, no bubble */
                  <div className="text-sm leading-relaxed text-foreground">
                    {m.content ? (
                      <MarkdownText text={m.content} />
                    ) : (
                      <ThinkingDots />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator for assistant (when last message has empty content) */}
            {isLoading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
              <div className="text-sm text-foreground">
                <ThinkingDots />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 sm:px-8 pb-6 pt-4 max-w-3xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative rounded-3xl border bg-card transition-all",
            "border-border focus-within:border-foreground/30 focus-within:shadow-sm"
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Resumai Copilot…"
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent px-5 pt-4 pb-12 text-sm text-foreground",
              "placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-60",
              "leading-relaxed"
            )}
            style={{ minHeight: 56, maxHeight: 200 }}
          />

          {/* Bottom row of input */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground text-background text-[11px] font-semibold transition-all hover:opacity-80"
              >
                <Square size={10} className="fill-current" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  input.trim()
                    ? "bg-foreground text-background hover:opacity-80"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send size={13} />
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-3">
          Resumai Copilot · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/* ── Inline markdown renderer ── */
function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Bullet point
        if (/^[-*•]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="mt-[3px] w-1 h-1 rounded-full bg-foreground/50 shrink-0 mt-2" />
              <span>{renderInline(line.replace(/^[-*•]\s/, ""))}</span>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-muted-foreground text-xs mt-0.5 shrink-0 tabular-nums w-4">{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        // Heading (##)
        if (/^#{1,3}\s/.test(line)) {
          return (
            <p key={i} className="font-semibold text-foreground mt-3 mb-1">
              {renderInline(line.replace(/^#+\s/, ""))}
            </p>
          );
        }

        // BEFORE/AFTER labels
        if (/^(BEFORE|AFTER):/.test(line)) {
          const [label, ...rest] = line.split(":");
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5",
                label === "BEFORE"
                  ? "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              )}>
                {label}
              </span>
              <span className="italic text-muted-foreground">{rest.join(":").trim()}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ── Thinking animation ── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}
