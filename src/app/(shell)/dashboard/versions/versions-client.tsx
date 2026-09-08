"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass as Search, FloppyDisk as Save, FileText,
  CaretDown as ChevronDown, Stack as Layers, ArrowCounterClockwise as RotateCcw,
} from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { toast } from "sonner";

type ChunkType = "summary" | "experience" | "education" | "skills" | "project";

interface Resume { id: string; file_name: string; created_at: string }
interface Chunk { id: string; content: string; chunk_type: ChunkType; similarity?: number }
interface Version {
  id: string; version_name: string; ats_score: number | null;
  created_at: string; job_description: string | null; parent_resume_id: string;
}

const CHUNK_COLOR: Record<ChunkType, string> = {
  summary: "#12a594",
  experience: "#059669",
  education: "#7c3aed",
  skills: "#d97706",
  project: "#0d9488",
};

const SECTION_ORDER: ChunkType[] = ["summary", "experience", "education", "skills", "project"];
const scoreColor = (s: number) => (s >= 75 ? "#059669" : s >= 55 ? "#d97706" : "#e11d48");

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium text-muted-foreground mb-1.5">{children}</p>;
}

export default function VersionsClient({ resumes }: { resumes: Resume[] }) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [allChunks, setAllChunks] = useState<Chunk[]>([]);
  const [relevantChunkIds, setRelevantChunkIds] = useState<Set<string>>(new Set());
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());
  const [versionName, setVersionName] = useState("");
  const [savedVersions, setSavedVersions] = useState<Version[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [generatingChunks, setGeneratingChunks] = useState(false);
  const [lastAtsScore, setLastAtsScore] = useState<number | null>(null);

  const loadChunks = useCallback(async (resumeId: string) => {
    if (!resumeId) return;
    setChunksLoading(true);
    setAllChunks([]); setSelectedChunkIds(new Set()); setRelevantChunkIds(new Set()); setLastAtsScore(null);
    try {
      const res = await fetch(`/api/resume/chunk?resume_id=${resumeId}`);
      const data = await res.json();
      if (data.error) { toast.error(data.error); } else { setAllChunks(data.chunks ?? []); }
    } catch { toast.error("Failed to load chunks"); } finally { setChunksLoading(false); }
  }, []);

  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/versions");
      const data = await res.json();
      setSavedVersions(data.versions ?? []);
    } catch {}
  }, []);

  useEffect(() => { if (selectedResumeId) loadChunks(selectedResumeId); }, [selectedResumeId, loadChunks]);
  useEffect(() => { loadVersions(); }, [loadVersions]);

  const generateChunks = async () => {
    if (!selectedResumeId) return;
    setGeneratingChunks(true);
    try {
      const res = await fetch("/api/resume/chunk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume_id: selectedResumeId }) });
      const data = await res.json();
      if (data.chunks_stored > 0) { toast.success(`Generated ${data.chunks_stored} sections`); loadChunks(selectedResumeId); }
      else { toast.error(data.error ?? "Could not generate sections"); }
    } catch { toast.error("Chunking failed"); } finally { setGeneratingChunks(false); }
  };

  const searchChunks = async () => {
    if (!jobDescription.trim()) { toast.error("Enter a job description first"); return; }
    if (!selectedResumeId) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/resume/search-chunks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: jobDescription, resume_id: selectedResumeId }) });
      const data = await res.json();
      const chunks: Chunk[] = data.chunks ?? [];
      const ids = new Set<string>(chunks.map((c) => c.id));
      setRelevantChunkIds(ids); setSelectedChunkIds(new Set(ids));
      const simMap = new Map<string, number>(chunks.map((c) => [c.id, c.similarity ?? 0]));
      setAllChunks((prev) => prev.map((c) => ({ ...c, similarity: simMap.get(c.id) })));
      toast.success(`${chunks.length} relevant sections found`);
    } catch { toast.error("Search failed"); } finally { setSearchLoading(false); }
  };

  const toggleChunk = (id: string) => {
    setSelectedChunkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedChunks = allChunks.filter((c) => selectedChunkIds.has(c.id));
  const previewContent = [...selectedChunks]
    .sort((a, b) => SECTION_ORDER.indexOf(a.chunk_type) - SECTION_ORDER.indexOf(b.chunk_type))
    .map((c) => c.content).join("\n\n");

  const sortedChunks = [...allChunks].sort((a, b) => {
    const aRel = relevantChunkIds.has(a.id) ? 0 : 1, bRel = relevantChunkIds.has(b.id) ? 0 : 1;
    if (aRel !== bRel) return aRel - bRel;
    if (a.similarity !== undefined && b.similarity !== undefined) return b.similarity - a.similarity;
    return SECTION_ORDER.indexOf(a.chunk_type) - SECTION_ORDER.indexOf(b.chunk_type);
  });

  const saveVersion = async () => {
    if (!versionName.trim()) { toast.error("Enter a version name"); return; }
    if (selectedChunkIds.size === 0) { toast.error("Select at least one section"); return; }
    setSaveLoading(true);
    try {
      const res = await fetch("/api/resume/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parent_resume_id: selectedResumeId, version_name: versionName, job_description: jobDescription, selected_chunks: selectedChunks }) });
      const data = await res.json();
      if (data.version_id) {
        setLastAtsScore(data.ats_score);
        toast.success(`Version saved${data.ats_score ? ` - ATS ${data.ats_score}/100` : ""}`);
        setVersionName(""); setSelectedChunkIds(new Set()); setRelevantChunkIds(new Set());
        loadVersions();
      } else { toast.error(data.error ?? "Save failed"); }
    } catch { toast.error("Save failed"); } finally { setSaveLoading(false); }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const fieldCls =
    "w-full text-[13px] px-2.5 py-1.5 rounded-md bg-white border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all";

  return (
    <div className="h-full flex flex-col">

      {/* Page header */}
      <div className="shrink-0 flex items-end justify-between px-6 md:px-8 pt-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Resume Versions</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Assemble a job-tailored resume from semantic sections.
          </p>
        </div>
        <span className="text-[12px] text-muted-foreground mb-0.5">
          {savedVersions.length} version{savedVersions.length !== 1 ? "s" : ""} saved
        </span>
      </div>

      {/* 3-column workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Controls */}
        <div className="flex flex-col overflow-y-auto shrink-0 border-r border-border bg-[#fbfbfc]" style={{ width: 272 }}>
          <div className="p-4 space-y-5">
            <div>
              <Label>Master resume</Label>
              {resumes.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No resumes yet - upload one first.</p>
              ) : (
                <div className="relative">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className={`${fieldCls} appearance-none pr-8 cursor-pointer`}
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.file_name.replace(/\.pdf$/i, "")}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              )}
            </div>

            <div>
              <Label>Job description</Label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to surface the most relevant resume sections."
                rows={9}
                className={`${fieldCls} leading-relaxed resize-none`}
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={searchChunks}
                disabled={searchLoading || !jobDescription.trim() || !selectedResumeId}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-md text-[12.5px] font-medium text-white bg-primary hover:bg-[#0f9184] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {searchLoading ? <><CoinLoader size={15} className="text-current" /> Searching...</> : <><Search size={15} weight="bold" /> Find relevant</>}
              </button>

              {relevantChunkIds.size > 0 && (
                <button
                  onClick={() => { setRelevantChunkIds(new Set()); setSelectedChunkIds(new Set()); setAllChunks((p) => p.map((c) => ({ ...c, similarity: undefined }))); }}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-white transition-colors"
                >
                  <RotateCcw size={13} /> Clear search
                </button>
              )}
            </div>

            {savedVersions.length > 0 && (
              <div>
                <Label>Saved</Label>
                <div className="rounded-md border border-border bg-white overflow-hidden">
                  {savedVersions.map((v, i) => {
                    const parent = resumes.find((r) => r.id === v.parent_resume_id);
                    return (
                      <div
                        key={v.id}
                        className={`flex items-center gap-2.5 px-3 py-2.5 ${i < savedVersions.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate text-foreground">{v.version_name}</p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            {parent?.file_name?.replace(/\.pdf$/i, "") ?? "-"}
                          </p>
                        </div>
                        {v.ats_score !== null && v.ats_score > 0 && (
                          <span className="text-[12px] font-semibold tabular-nums shrink-0" style={{ color: scoreColor(v.ats_score) }}>
                            {v.ats_score}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Chunks */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                {relevantChunkIds.size > 0
                  ? `${relevantChunkIds.size} relevant - ${allChunks.length} total`
                  : `${allChunks.length} section${allChunks.length !== 1 ? "s" : ""}`}
              </p>
              {selectedChunkIds.size > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-primary">
                  {selectedChunkIds.size} selected
                </span>
              )}
            </div>

            {chunksLoading ? (
              <div className="flex items-center justify-center py-20">
                <CoinLoader size={40} />
              </div>
            ) : allChunks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 border border-border">
                  <Layers size={22} className="text-muted-foreground" />
                </div>
                <p className="text-[13px] font-medium mb-1 text-foreground">No sections yet</p>
                <p className="text-[12px] max-w-[220px] leading-relaxed mb-4 text-muted-foreground">
                  {selectedResume ? "Generate semantic sections from this resume to start building versions." : "Select a resume to get started."}
                </p>
                {selectedResume && (
                  <button
                    onClick={generateChunks}
                    disabled={generatingChunks}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-[12.5px] font-medium text-white bg-primary hover:bg-[#0f9184] disabled:opacity-50 transition-colors"
                  >
                    {generatingChunks && <CoinLoader size={15} className="text-current" />}
                    {generatingChunks ? "Generating..." : "Generate sections"}
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                {sortedChunks.map((chunk, i) => {
                  const isSelected = selectedChunkIds.has(chunk.id);
                  const isRelevant = relevantChunkIds.has(chunk.id);
                  const dotColor = CHUNK_COLOR[chunk.chunk_type] ?? "#12a594";

                  return (
                    <button
                      key={chunk.id}
                      onClick={() => toggleChunk(chunk.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                        i < sortedChunks.length - 1 ? "border-b border-border" : ""
                      } ${isSelected ? "bg-[#f8f8f9]" : "hover:bg-[#f8f8f9]"}`}
                      style={isSelected ? { boxShadow: `inset 3px 0 0 ${dotColor}` } : undefined}
                    >
                      <span
                        className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-colors"
                        style={{
                          background: isSelected ? dotColor : "#fff",
                          borderColor: isSelected ? dotColor : "var(--input)",
                        }}
                      >
                        {isSelected && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.04em]" style={{ color: dotColor }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                            {chunk.chunk_type}
                          </span>
                          {isRelevant && (
                            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                              Relevant
                            </span>
                          )}
                          {chunk.similarity !== undefined && (
                            <span className="text-[10px] tabular-nums ml-auto text-muted-foreground">
                              {Math.round(chunk.similarity * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] leading-relaxed line-clamp-3 text-muted-foreground">
                          {chunk.content}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview + Save */}
        <div className="flex flex-col overflow-hidden shrink-0 border-l border-border bg-[#fbfbfc]" style={{ width: 300 }}>
          <div className="px-4 py-3 shrink-0 border-b border-border">
            <p className="text-[11px] font-medium text-muted-foreground">Preview</p>
            {selectedChunkIds.size > 0 && (
              <p className="text-[10.5px] mt-0.5 text-muted-foreground">
                {selectedChunkIds.size} section{selectedChunkIds.size !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {previewContent ? (
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground" style={{ fontFamily: "inherit" }}>
                {previewContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <FileText size={24} className="text-muted-foreground/50" />
                <p className="text-[11px] mt-2.5 max-w-[170px] leading-relaxed text-muted-foreground">
                  Select sections to preview your assembled resume.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 shrink-0 border-t border-border">
            <div>
              <Label>Version name</Label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveVersion()}
                placeholder="e.g. Frontend Role v2"
                className={fieldCls}
              />
            </div>

            <button
              onClick={saveVersion}
              disabled={saveLoading || !versionName.trim() || selectedChunkIds.size === 0}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-md text-[12.5px] font-medium text-white bg-primary hover:bg-[#0f9184] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              {saveLoading ? <><CoinLoader size={15} className="text-current" /> Saving...</> : <><Save size={15} weight="bold" /> Save version</>}
            </button>

            {lastAtsScore !== null && (
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="text-[11px] font-medium text-muted-foreground">ATS score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[17px] font-semibold tabular-nums" style={{ color: scoreColor(lastAtsScore) }}>
                    {lastAtsScore}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
              </div>
            )}

            {selectedChunkIds.size > 0 && !saveLoading && !lastAtsScore && (
              <p className="text-[10.5px] text-center text-muted-foreground">ATS score calculated on save</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
