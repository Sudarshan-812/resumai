"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Save, FileText, ChevronDown, Layers, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";

type ChunkType = "summary" | "experience" | "education" | "skills" | "project";

interface Resume { id: string; file_name: string; created_at: string }
interface Chunk  { id: string; content: string; chunk_type: ChunkType; similarity?: number }
interface Version {
  id: string; version_name: string; ats_score: number | null;
  created_at: string; job_description: string | null; parent_resume_id: string;
}

const CHUNK_COLOR: Record<ChunkType, string> = {
  summary:    "#06b6d4",
  experience: "#059669",
  education:  "#7c3aed",
  skills:     "#d97706",
  project:    "#0d9488",
};

const SECTION_ORDER: ChunkType[] = ["summary", "experience", "education", "skills", "project"];
const scoreColor = (s: number) => s >= 75 ? "#059669" : s >= 55 ? "#d97706" : "#e11d48";
const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

/* ── Underline input ─────────────────────────────────────────── */
function UField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "#6B6860" }}>{label}</p>
      {children}
    </div>
  );
}

export default function VersionsClient({ resumes }: { resumes: Resume[] }) {
  const [selectedResumeId, setSelectedResumeId]   = useState(resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription]       = useState("");
  const [allChunks, setAllChunks]                 = useState<Chunk[]>([]);
  const [relevantChunkIds, setRelevantChunkIds]   = useState<Set<string>>(new Set());
  const [selectedChunkIds, setSelectedChunkIds]   = useState<Set<string>>(new Set());
  const [versionName, setVersionName]             = useState("");
  const [savedVersions, setSavedVersions]         = useState<Version[]>([]);
  const [chunksLoading, setChunksLoading]         = useState(false);
  const [searchLoading, setSearchLoading]         = useState(false);
  const [saveLoading, setSaveLoading]             = useState(false);
  const [generatingChunks, setGeneratingChunks]   = useState(false);
  const [lastAtsScore, setLastAtsScore]           = useState<number | null>(null);

  const loadChunks = useCallback(async (resumeId: string) => {
    if (!resumeId) return;
    setChunksLoading(true);
    setAllChunks([]); setSelectedChunkIds(new Set()); setRelevantChunkIds(new Set()); setLastAtsScore(null);
    try {
      const res  = await fetch(`/api/resume/chunk?resume_id=${resumeId}`);
      const data = await res.json();
      if (data.error) { toast.error(data.error); } else { setAllChunks(data.chunks ?? []); }
    } catch { toast.error("Failed to load chunks"); } finally { setChunksLoading(false); }
  }, []);

  const loadVersions = useCallback(async () => {
    try {
      const res  = await fetch("/api/resume/versions");
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
      const res  = await fetch("/api/resume/chunk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume_id: selectedResumeId }) });
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
      const res    = await fetch("/api/resume/search-chunks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: jobDescription, resume_id: selectedResumeId }) });
      const data   = await res.json();
      const chunks: Chunk[] = data.chunks ?? [];
      const ids    = new Set<string>(chunks.map((c) => c.id));
      setRelevantChunkIds(ids); setSelectedChunkIds(new Set(ids));
      const simMap = new Map<string, number>(chunks.map((c) => [c.id, c.similarity ?? 0]));
      setAllChunks((prev) => prev.map((c) => ({ ...c, similarity: simMap.get(c.id) })));
      toast.success(`${chunks.length} relevant sections found`);
    } catch { toast.error("Search failed"); } finally { setSearchLoading(false); }
  };

  const toggleChunk = (id: string) => {
    setSelectedChunkIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
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
      const res  = await fetch("/api/resume/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parent_resume_id: selectedResumeId, version_name: versionName, job_description: jobDescription, selected_chunks: selectedChunks }) });
      const data = await res.json();
      if (data.version_id) {
        setLastAtsScore(data.ats_score);
        toast.success(`Version saved${data.ats_score ? ` · ATS ${data.ats_score}/100` : ""}`);
        setVersionName(""); setSelectedChunkIds(new Set()); setRelevantChunkIds(new Set());
        loadVersions();
      } else { toast.error(data.error ?? "Save failed"); }
    } catch { toast.error("Save failed"); } finally { setSaveLoading(false); }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <DashboardShell>
      <div className="h-full flex flex-col" style={{ background: "#F7F6F2" }}>

        {/* ── Page header (white) ── */}
        <div className="shrink-0 flex items-end justify-between px-6 md:px-8 pt-8 pb-5"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: "#9B9890" }}>AI Tools</p>
            <h1 className="font-display font-semibold tracking-tight" style={{ color: "#111111", fontSize: "clamp(22px,4vw,30px)", lineHeight: 1.15 }}>
              Resume Versions
            </h1>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
            className="text-[10px] font-mono mb-1" style={{ color: "#9B9890" }}>
            {savedVersions.length} version{savedVersions.length !== 1 ? "s" : ""} saved
          </motion.span>
        </div>

        {/* ── 3-column workspace ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left: Controls ── */}
          <div className="flex flex-col overflow-y-auto shrink-0"
            style={{ width: 260, borderRight: "1px solid #E5E3DC", background: "#FFFFFF" }}>
            <div className="p-5 space-y-6">

              {/* Resume selector */}
              <UField label="Master Resume">
                {resumes.length === 0 ? (
                  <p className="text-[12px]" style={{ color: "#9B9890" }}>No resumes yet — upload one first.</p>
                ) : (
                  <div className="relative">
                    <select value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}
                      className="w-full text-[13px] py-1.5 pr-6 appearance-none outline-none bg-transparent"
                      style={{ color: "#111111", borderBottom: "1px solid #C8C4BB" }}>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>{r.file_name.replace(/\.pdf$/i, "")}</option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9B9890" }} />
                  </div>
                )}
              </UField>

              {/* Job description */}
              <UField label="Job Description">
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the job description to surface the most relevant resume sections…"
                  rows={10}
                  className="w-full text-[12px] leading-relaxed bg-transparent resize-none outline-none placeholder:text-[#C8C4BB] pt-1"
                  style={{ color: "#111111", borderBottom: "1px solid #C8C4BB" }}
                />
              </UField>

              {/* Search */}
              <div className="space-y-2">
                <motion.button onClick={searchChunks}
                  disabled={searchLoading || !jobDescription.trim() || !selectedResumeId}
                  whileHover={!searchLoading ? { y: -1, boxShadow: "0 10px 24px rgba(6,182,212,0.24)" } : {}}
                  whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-bold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 14px rgba(6,182,212,0.18)" }}>
                  {searchLoading ? <><Loader2 size={12} className="animate-spin" />Searching…</> : <><Search size={12} strokeWidth={2.2} />Find Relevant</>}
                </motion.button>

                <AnimatePresence>
                  {relevantChunkIds.size > 0 && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      onClick={() => { setRelevantChunkIds(new Set()); setSelectedChunkIds(new Set()); setAllChunks(p => p.map(c => ({ ...c, similarity: undefined }))); }}
                      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-medium"
                      style={{ color: "#9B9890", border: "1px solid #E5E3DC" }}>
                      <RotateCcw size={10} /> Clear search
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Saved versions in sidebar */}
              {savedVersions.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.18em] mb-3" style={{ color: "#9B9890" }}>Saved</p>
                  <div className="space-y-0">
                    {savedVersions.map((v, i) => {
                      const parent = resumes.find(r => r.id === v.parent_resume_id);
                      return (
                        <motion.div key={v.id}
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 26 }}
                          className="flex items-center gap-3 py-3"
                          style={{ borderBottom: i < savedVersions.length - 1 ? "1px solid #F0EFE9" : "none" }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#06b6d4" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold truncate" style={{ color: "#111111" }}>{v.version_name}</p>
                            <p className="text-[10px] font-mono" style={{ color: "#C8C4BB" }}>
                              {parent?.file_name?.replace(/\.pdf$/i, "") ?? "—"}
                            </p>
                          </div>
                          {v.ats_score !== null && v.ats_score > 0 && (
                            <span className="text-[12px] font-black font-mono shrink-0" style={{ color: scoreColor(v.ats_score) }}>{v.ats_score}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Middle: Chunks ── */}
          <div className="flex-1 overflow-y-auto" style={{ background: "#F7F6F2" }}>
            <div className="p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "#9B9890" }}>
                  {relevantChunkIds.size > 0
                    ? `${relevantChunkIds.size} relevant · ${allChunks.length} total`
                    : `${allChunks.length} section${allChunks.length !== 1 ? "s" : ""}`}
                </p>
                <AnimatePresence>
                  {selectedChunkIds.size > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                      transition={SPRING}
                      className="text-[9px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: "#06b6d4" }}>
                      {selectedChunkIds.size} selected
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              {chunksLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={18} className="animate-spin" style={{ color: "#06b6d4" }} />
                </div>
              ) : allChunks.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  transition={SPRING}
                  className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                    <Layers size={18} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[14px] font-semibold mb-1.5" style={{ color: "#111111" }}>No sections yet</p>
                  <p className="text-[12px] max-w-[200px] leading-relaxed mb-5" style={{ color: "#9B9890" }}>
                    {selectedResume ? "Generate semantic sections from this resume to start building versions." : "Select a resume to get started."}
                  </p>
                  {selectedResume && (
                    <motion.button onClick={generateChunks} disabled={generatingChunks}
                      whileHover={!generatingChunks ? { y: -1, boxShadow: "0 10px 24px rgba(6,182,212,0.24)" } : {}}
                      whileTap={{ scale: 0.97 }} transition={SPRING}
                      className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-[12px] font-bold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 14px rgba(6,182,212,0.18)" }}>
                      {generatingChunks && <Loader2 size={12} className="animate-spin" />}
                      {generatingChunks ? "Generating…" : "Generate Sections"}
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-0">
                  {sortedChunks.map((chunk, i) => {
                    const isSelected = selectedChunkIds.has(chunk.id);
                    const isRelevant = relevantChunkIds.has(chunk.id);
                    const dotColor   = CHUNK_COLOR[chunk.chunk_type] ?? "#06b6d4";

                    return (
                      <motion.div key={chunk.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: "spring", stiffness: 260, damping: 26 }}
                        onClick={() => toggleChunk(chunk.id)}
                        className="flex items-start gap-3 py-4 cursor-pointer group"
                        style={{
                          borderBottom: "1px solid #E5E3DC",
                          borderLeft: isSelected ? `3px solid ${dotColor}` : "3px solid transparent",
                          paddingLeft: 12,
                          background: isSelected ? `${dotColor}08` : "transparent",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {/* Checkbox */}
                        <motion.div
                          animate={{ background: isSelected ? dotColor : "#FFFFFF", borderColor: isSelected ? dotColor : "#D4D0C8" }}
                          transition={{ duration: 0.15 }}
                          className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center"
                          style={{ border: "1.5px solid #D4D0C8", marginTop: 2 }}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {/* Type dot + label */}
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.12em] font-bold"
                              style={{ color: dotColor }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                              {chunk.chunk_type}
                            </span>
                            {isRelevant && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}>
                                Relevant
                              </span>
                            )}
                            {chunk.similarity !== undefined && (
                              <span className="text-[9px] font-mono ml-auto" style={{ color: "#9B9890" }}>
                                {Math.round(chunk.similarity * 100)}%
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: "#2D2C2A" }}>
                            {chunk.content}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Preview + Save ── */}
          <div className="flex flex-col overflow-hidden shrink-0"
            style={{ width: 300, borderLeft: "1px solid #E5E3DC", background: "#FFFFFF" }}>

            {/* Preview header */}
            <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid #E5E3DC" }}>
              <p className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "#6B6860" }}>Preview</p>
              {selectedChunkIds.size > 0 && (
                <p className="text-[10px] mt-0.5" style={{ color: "#9B9890" }}>
                  {selectedChunkIds.size} section{selectedChunkIds.size !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {previewContent ? (
                <motion.pre
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  className="text-[11px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: "#2D2C2A", fontFamily: "inherit" }}>
                  {previewContent}
                </motion.pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    <FileText size={22} style={{ color: "#D4D0C8" }} strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-[11px] mt-3 max-w-[160px] leading-relaxed" style={{ color: "#C8C4BB" }}>
                    Select sections to preview your assembled resume
                  </p>
                </div>
              )}
            </div>

            {/* Save */}
            <div className="p-5 space-y-4 shrink-0" style={{ borderTop: "1px solid #E5E3DC" }}>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.18em] mb-2" style={{ color: "#6B6860" }}>Version Name</p>
                <div className="relative">
                  <input
                    type="text"
                    value={versionName}
                    onChange={e => setVersionName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveVersion()}
                    placeholder="e.g. Frontend Role v2"
                    className="w-full text-[13px] py-1.5 bg-transparent outline-none placeholder:text-[#C8C4BB]"
                    style={{ color: "#111111", borderBottom: "1px solid #C8C4BB" }}
                  />
                </div>
              </div>

              <motion.button
                onClick={saveVersion}
                disabled={saveLoading || !versionName.trim() || selectedChunkIds.size === 0}
                whileHover={!saveLoading && versionName.trim() && selectedChunkIds.size > 0
                  ? { y: -1, boxShadow: "0 10px 24px rgba(6,182,212,0.24)" } : {}}
                whileTap={{ scale: 0.97 }} transition={SPRING}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-bold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 14px rgba(6,182,212,0.16)" }}>
                {saveLoading
                  ? <><Loader2 size={12} className="animate-spin" />Saving…</>
                  : <><Save size={12} strokeWidth={2.2} />Save Version</>
                }
              </motion.button>

              <AnimatePresence>
                {lastAtsScore !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={SPRING}
                    className="flex items-center justify-between py-2"
                    style={{ borderTop: "1px solid #F0EFE9" }}>
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: "#9B9890" }}>ATS Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[18px] font-black font-mono" style={{ color: scoreColor(lastAtsScore), letterSpacing: "-0.03em" }}>
                        {lastAtsScore}
                      </span>
                      <span className="text-[10px]" style={{ color: "#C8C4BB" }}>/100</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedChunkIds.size > 0 && !saveLoading && !lastAtsScore && (
                <p className="text-[10px] text-center" style={{ color: "#C8C4BB" }}>ATS score calculated on save</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
