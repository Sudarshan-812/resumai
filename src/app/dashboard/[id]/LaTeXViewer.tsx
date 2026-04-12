"use client";

import { useState } from "react";
import { Code2, Eye, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Extract the content of a balanced {...} starting at position `start`, skipping leading whitespace */
function extractBraced(src: string, start: number): { content: string; end: number } | null {
  let pos = start;
  while (pos < src.length && /[ \t]/.test(src[pos])) pos++;
  if (pos >= src.length || src[pos] !== "{") return null;
  let depth = 0;
  let content = "";
  while (pos < src.length) {
    const ch = src[pos];
    if (ch === "{") { if (depth > 0) content += ch; depth++; }
    else if (ch === "}") { depth--; if (depth === 0) return { content, end: pos + 1 }; else content += ch; }
    else if (depth > 0) content += ch;
    pos++;
  }
  return null;
}

/** Extract `count` consecutive {...} groups starting at position `start` */
function extractArgs(src: string, start: number, count: number): { args: string[]; end: number } {
  const args: string[] = [];
  let pos = start;
  for (let n = 0; n < count; n++) {
    while (pos < src.length && /\s/.test(src[pos])) pos++;
    const r = extractBraced(src, pos);
    if (!r) break;
    args.push(r.content);
    pos = r.end;
  }
  return { args, end: pos };
}

// ─── Inline LaTeX renderer ────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let buf = "";

  const flush = () => {
    if (buf) { nodes.push(<span key={`s-${nodes.length}`}>{buf}</span>); buf = ""; }
  };

  while (i < text.length) {
    // $|$ separator
    if (text[i] === "$" && text.slice(i, i + 3) === "$|$") {
      flush();
      nodes.push(<span key={`sep-${nodes.length}`} className="mx-1.5 text-gray-400 font-sans">|</span>);
      i += 3;
      continue;
    }

    if (text[i] !== "\\") {
      buf += text[i++];
      continue;
    }

    const rest = text.slice(i);

    // \textbf{...}
    if (rest.startsWith("\\textbf")) {
      const r = extractBraced(text, i + 7);
      if (r) { flush(); nodes.push(<strong key={`b-${nodes.length}`} className="font-semibold">{renderInline(r.content)}</strong>); i = r.end; continue; }
    }

    // \textit{...}
    if (rest.startsWith("\\textit")) {
      const r = extractBraced(text, i + 7);
      if (r) { flush(); nodes.push(<em key={`it-${nodes.length}`} className="italic">{renderInline(r.content)}</em>); i = r.end; continue; }
    }

    // \small{...}
    if (rest.startsWith("\\small")) {
      const r = extractBraced(text, i + 6);
      if (r) { flush(); nodes.push(<span key={`sm-${nodes.length}`} className="text-[10.5px]">{renderInline(r.content)}</span>); i = r.end; continue; }
    }

    // \href{url}{text}
    if (rest.startsWith("\\href")) {
      const urlR = extractBraced(text, i + 5);
      if (urlR) {
        const txtR = extractBraced(text, urlR.end);
        if (txtR) {
          flush();
          nodes.push(
            <a key={`a-${nodes.length}`} href={urlR.content} target="_blank" rel="noreferrer"
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800">
              {renderInline(txtR.content)}
            </a>
          );
          i = txtR.end;
          continue;
        }
      }
    }

    // \projectLink{text}{url}
    if (rest.startsWith("\\projectLink")) {
      const txtR = extractBraced(text, i + 12);
      if (txtR) {
        const urlR = extractBraced(text, txtR.end);
        if (urlR) {
          flush();
          nodes.push(
            <a key={`pl-${nodes.length}`} href={urlR.content} target="_blank" rel="noreferrer"
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800">
              {renderInline(txtR.content)}
            </a>
          );
          i = urlR.end;
          continue;
        }
      }
    }

    // \textcolor{color}{text}
    if (rest.startsWith("\\textcolor")) {
      const colorR = extractBraced(text, i + 10);
      if (colorR) {
        const txtR = extractBraced(text, colorR.end);
        if (txtR) {
          flush();
          nodes.push(<span key={`tc-${nodes.length}`} style={{ color: colorR.content }}>{renderInline(txtR.content)}</span>);
          i = txtR.end;
          continue;
        }
      }
    }

    // \\ double-backslash → soft break
    if (rest.startsWith("\\\\")) { buf += " "; i += 2; continue; }
    // \& → &
    if (rest.startsWith("\\&")) { buf += "&"; i += 2; continue; }
    // \% → %
    if (rest.startsWith("\\%")) { buf += "%"; i += 2; continue; }
    // \~ → ~
    if (rest.startsWith("\\~")) { buf += "~"; i += 2; continue; }

    // Unknown command — skip command name
    let j = i + 1;
    while (j < text.length && /[a-zA-Z*]/.test(text[j])) j++;
    i = j;
  }

  flush();
  if (nodes.length === 0) return "";
  if (nodes.length === 1) return nodes[0];
  return <>{nodes}</>;
}

// ─── Document parser ──────────────────────────────────────────────────────

type DocNode =
  | { t: "header"; lines: string[] }
  | { t: "section"; name: string }
  | { t: "subheading"; args: string[] }
  | { t: "projectheading"; args: string[] }
  | { t: "item"; content: string }
  | { t: "skills"; content: string };

const SKIP_MARKERS = [
  "\\resumeSubHeadingListStart",
  "\\resumeSubHeadingListEnd",
  "\\resumeItemListStart",
  "\\resumeItemListEnd",
];

function parseLatex(latex: string): DocNode[] {
  const nodes: DocNode[] = [];

  // Extract body between \begin{document} and \end{document}
  const bodyMatch = latex.match(/\\begin\{document\}([\s\S]*?)(?:\\end\{document\}|$)/);
  const body = bodyMatch ? bodyMatch[1] : latex;

  // Extract header block (\begin{center}...\end{center})
  const centerMatch = body.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (centerMatch) {
    const raw = centerMatch[1].trim();
    // Split on \\ (with optional [...] spacing arg)
    const lines = raw
      .split(/\\\\(\[.*?\])?/)
      .filter((_, idx) => idx % 2 === 0)
      .map((l) => l.trim())
      .filter(Boolean);
    nodes.push({ t: "header", lines });
  }

  // Remove center block, then parse remaining body
  const work = body.replace(/\\begin\{center\}[\s\S]*?\\end\{center\}/, "");

  let i = 0;
  while (i < work.length) {
    if (/\s/.test(work[i])) { i++; continue; }
    if (work[i] !== "\\") { i++; continue; }

    const rest = work.slice(i);

    // Skip list start/end markers
    let skipped = false;
    for (const marker of SKIP_MARKERS) {
      if (rest.startsWith(marker)) {
        i += marker.length;
        skipped = true;
        break;
      }
    }
    if (skipped) continue;

    // \section{name}
    if (rest.startsWith("\\section")) {
      const r = extractBraced(work, i + 8);
      if (r) { nodes.push({ t: "section", name: r.content }); i = r.end; continue; }
    }

    // \resumeSubheading{A}{B}{C}{D}
    if (rest.startsWith("\\resumeSubheading")) {
      const { args, end } = extractArgs(work, i + 17, 4);
      nodes.push({ t: "subheading", args });
      i = end;
      continue;
    }

    // \resumeProjectHeading{A}{B}
    if (rest.startsWith("\\resumeProjectHeading")) {
      const { args, end } = extractArgs(work, i + 21, 2);
      nodes.push({ t: "projectheading", args });
      i = end;
      continue;
    }

    // \resumeItem{content}
    if (rest.startsWith("\\resumeItem")) {
      const r = extractBraced(work, i + 11);
      if (r) { nodes.push({ t: "item", content: r.content }); i = r.end; continue; }
    }

    // \small{...} — used for skills lines
    if (rest.startsWith("\\small")) {
      const r = extractBraced(work, i + 6);
      if (r) { nodes.push({ t: "skills", content: r.content }); i = r.end; continue; }
    }

    // Skip unknown command
    let j = i + 1;
    while (j < work.length && /[a-zA-Z*]/.test(work[j])) j++;
    i = Math.max(i + 1, j);
  }

  return nodes;
}

// ─── Name extractor for header ────────────────────────────────────────────

function extractNameFromLine(line: string): string {
  // {\Huge \bfseries John Doe}  or  \textbf{John Doe}
  const bfsMatch = line.match(/\\bfseries\s+([^\\{}[\]]+)/);
  if (bfsMatch) return bfsMatch[1].trim();
  const tbfR = extractBraced(line, (line.indexOf("\\textbf") + 7) || 0);
  if (tbfR) return tbfR.content;
  // Fallback: strip all commands and braces
  return line.replace(/\\[a-zA-Z]+\*?\s*/g, "").replace(/[{}[\]]/g, "").trim();
}

// ─── LaTeXPreview ─────────────────────────────────────────────────────────

function LaTeXPreview({ code }: { code: string }) {
  const nodes = parseLatex(code);

  return (
    <div className="bg-white text-gray-900 min-h-full p-8 sm:p-10 max-w-[700px] mx-auto shadow-sm"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "12px", lineHeight: 1.55 }}>

      {nodes.map((node, idx) => {
        switch (node.t) {

          case "header": {
            return (
              <div key={idx} className="text-center mb-4">
                {node.lines.map((line, li) => {
                  if (li === 0) {
                    const name = extractNameFromLine(line);
                    return (
                      <h1 key={li} style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.3px", marginBottom: "4px" }}>
                        {name}
                      </h1>
                    );
                  }
                  return (
                    <p key={li} style={{ fontSize: "11px", color: "#444", marginBottom: "2px" }}>
                      {renderInline(line)}
                    </p>
                  );
                })}
              </div>
            );
          }

          case "section":
            return (
              <div key={idx} style={{ marginTop: "14px", marginBottom: "5px" }}>
                <h2 style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#111",
                  borderBottom: "1px solid #111",
                  paddingBottom: "2px",
                  fontVariant: "small-caps",
                }}>
                  {node.name}
                </h2>
              </div>
            );

          case "subheading": {
            const [org = "", date = "", role = "", loc = ""] = node.args;
            return (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "12px" }}>{renderInline(org)}</span>
                  <span style={{ fontSize: "11px", color: "#555" }}>{renderInline(date)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontStyle: "italic", fontSize: "11.5px" }}>{renderInline(role)}</span>
                  <span style={{ fontStyle: "italic", fontSize: "11px", color: "#555" }}>{renderInline(loc)}</span>
                </div>
              </div>
            );
          }

          case "projectheading": {
            const [title = "", date = ""] = node.args;
            return (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "12px" }}>{renderInline(title)}</span>
                <span style={{ fontSize: "11px", color: "#555" }}>{renderInline(date)}</span>
              </div>
            );
          }

          case "item":
            return (
              <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginLeft: "10px", marginBottom: "2px" }}>
                <span style={{ marginTop: "5px", width: "4px", height: "4px", borderRadius: "50%", background: "#333", flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: "11.5px", lineHeight: 1.55 }}>{renderInline(node.content)}</span>
              </div>
            );

          case "skills":
            return (
              <div key={idx} style={{ marginLeft: "10px", marginBottom: "2px", fontSize: "11.5px" }}>
                {renderInline(node.content)}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── Syntax-highlighted code view ─────────────────────────────────────────

function highlightLine(line: string, lineIdx: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let buf = "";
  const n = () => `${lineIdx}-${i}`;

  const flushBuf = () => {
    if (buf) { parts.push(<span key={`t-${n()}`} className="text-foreground/70">{buf}</span>); buf = ""; }
  };

  while (i < line.length) {
    if (line[i] === "%") {
      flushBuf();
      parts.push(<span key={`c-${n()}`} className="text-emerald-500/80">{line.slice(i)}</span>);
      break;
    }
    if (line[i] === "\\") {
      flushBuf();
      let cmd = "\\";
      let j = i + 1;
      while (j < line.length && /[a-zA-Z*]/.test(line[j])) { cmd += line[j]; j++; }
      parts.push(<span key={`cmd-${n()}`} className="text-violet-400 font-medium">{cmd}</span>);
      i = j;
      continue;
    }
    if (line[i] === "{" || line[i] === "}") {
      flushBuf();
      parts.push(<span key={`br-${n()}`} className="text-gray-400">{line[i]}</span>);
      i++; continue;
    }
    if (line[i] === "[" || line[i] === "]") {
      flushBuf();
      parts.push(<span key={`sq-${n()}`} className="text-amber-400">{line[i]}</span>);
      i++; continue;
    }
    if (line[i] === "$") {
      flushBuf();
      parts.push(<span key={`m-${n()}`} className="text-rose-400">{line[i]}</span>);
      i++; continue;
    }
    buf += line[i++];
  }
  flushBuf();
  return <>{parts}</>;
}

function LaTeXCodeView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className="relative h-full flex flex-col">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 h-7 px-3 rounded-md bg-muted border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-6">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none w-8 shrink-0 text-right mr-4 text-muted-foreground/30 text-[10px] leading-6">
              {i + 1}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-all">
              {highlightLine(line, i)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────

interface LaTeXViewerProps {
  code: string;
  fileName?: string;
  isLoading?: boolean;
  isAiLoading?: boolean;
}

export default function LaTeXViewer({ code, fileName, isLoading, isAiLoading }: LaTeXViewerProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2.5 border-b border-border shrink-0 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          {fileName && (
            <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[150px]">
              {fileName}
            </span>
          )}
          {isAiLoading && (
            <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI updating…
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 border border-border shrink-0">
          <button
            onClick={() => setTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
              tab === "preview"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye size={11} />
            Preview
          </button>
          <button
            onClick={() => setTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
              tab === "code"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 size={11} />
            LaTeX
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div className="w-7 h-7 rounded-full border-2 border-border border-t-foreground/60 animate-spin" />
            <p className="text-xs text-muted-foreground">Generating formatted resume…</p>
          </div>
        ) : !code ? (
          <div className="flex items-center justify-center h-full py-12">
            <p className="text-xs text-muted-foreground">No LaTeX content available.</p>
          </div>
        ) : tab === "preview" ? (
          <LaTeXPreview code={code} />
        ) : (
          <LaTeXCodeView code={code} />
        )}
      </div>
    </div>
  );
}
