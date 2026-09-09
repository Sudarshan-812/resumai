"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

/** Editable raw-LaTeX pane. Every keystroke flows straight back up to the
 *  shared `latexCode` state, so the live render on the left stays in sync. */
export default function LatexSource({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lineCount = value ? value.split("\n").length : 1;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked - ignore */
    }
  };

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#fbfbfc]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <span className="text-[11px] text-muted-foreground">
          Editable · renders live on the left
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden font-mono text-[11px] leading-5">
        <div
          ref={gutterRef}
          className="shrink-0 overflow-hidden py-3 pl-3 pr-2 text-right text-muted-foreground/30 select-none bg-[#f4f4f5] border-r border-border"
          aria-hidden
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          wrap="off"
          placeholder="LaTeX source will appear here once it's generated…"
          className="flex-1 resize-none bg-transparent py-3 px-3 text-foreground/80 outline-none"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}
