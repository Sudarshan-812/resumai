"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Save,
  FileText,
  ChevronDown,
  Layers,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";

type ChunkType = "summary" | "experience" | "education" | "skills" | "project";

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
}

interface Chunk {
  id: string;
  content: string;
  chunk_type: ChunkType;
  similarity?: number;
}

interface Version {
  id: string;
  version_name: string;
  ats_score: number | null;
  created_at: string;
  job_description: string | null;
  parent_resume_id: string;
}

const BADGE: Record<ChunkType, { bg: string; text: string; border: string }> = {
  summary:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  experience: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  education:  { bg: "#FAF5FF", text: "#7C3AED", border: "#DDD6FE" },
  skills:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  project:    { bg: "#F0FDFA", text: "#0D9488", border: "#99F6E4" },
};

const SECTION_ORDER: ChunkType[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "project",
];

const scoreColor = (s: number) =>
  s >= 75 ? "#059669" : s >= 55 ? "#d97706" : "#e11d48";

const EASE = [0.16, 1, 0.3, 1] as const;

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
    setAllChunks([]);
    setSelectedChunkIds(new Set());
    setRelevantChunkIds(new Set());
    setLastAtsScore(null);
    try {
      const res = await fetch(`/api/resume/chunk?resume_id=${resumeId}`);
      const data = await res.json();
      setAllChunks(data.chunks ?? []);
    } catch {
      toast.error("Failed to load chunks");
    } finally {
      setChunksLoading(false);
    }
  }, []);

  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/versions");
      const data = await res.json();
      setSavedVersions(data.versions ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedResumeId) loadChunks(selectedResumeId);
  }, [selectedResumeId, loadChunks]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const generateChunks = async () => {
    if (!selectedResumeId) return;
    setGeneratingChunks(true);
    try {
      const res = await fetch("/api/resume/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: selectedResumeId }),
      });
      const data = await res.json();
      if (data.chunks_stored > 0) {
        toast.success(`Generated ${data.chunks_stored} sections`);
        loadChunks(selectedResumeId);
      } else {
        toast.error("Could not generate chunks");
      }
    } catch {
      toast.error("Chunking failed");
    } finally {
      setGeneratingChunks(false);
    }
  };

  const searchChunks = async () => {
    if (!jobDescription.trim()) {
      toast.error("Enter a job description first");
      return;
    }
    if (!selectedResumeId) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/resume/search-chunks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: jobDescription, resume_id: selectedResumeId }),
      });
      const data = await res.json();
      const chunks: Chunk[] = data.chunks ?? [];
      const ids = new Set<string>(chunks.map((c) => c.id));
      setRelevantChunkIds(ids);
      setSelectedChunkIds(new Set(ids));

      const simMap = new Map<string, number>(
        chunks.map((c) => [c.id, c.similarity ?? 0])
      );
      setAllChunks((prev) =>
        prev.map((c) => ({ ...c, similarity: simMap.get(c.id) }))
      );
      toast.success(`${chunks.length} relevant sections found`);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleChunk = (id: string) => {
    setSelectedChunkIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedChunks = allChunks.filter((c) => selectedChunkIds.has(c.id));
  const previewContent = [...selectedChunks]
    .sort(
      (a, b) =>
        SECTION_ORDER.indexOf(a.chunk_type) - SECTION_ORDER.indexOf(b.chunk_type)
    )
    .map((c) => c.content)
    .join("\n\n");

  const sortedChunks = [...allChunks].sort((a, b) => {
    const aRel = relevantChunkIds.has(a.id) ? 0 : 1;
    const bRel = relevantChunkIds.has(b.id) ? 0 : 1;
    if (aRel !== bRel) return aRel - bRel;
    if (a.similarity !== undefined && b.similarity !== undefined)
      return b.similarity - a.similarity;
    return (
      SECTION_ORDER.indexOf(a.chunk_type) - SECTION_ORDER.indexOf(b.chunk_type)
    );
  });

  const saveVersion = async () => {
    if (!versionName.trim()) {
      toast.error("Enter a version name");
      return;
    }
    if (selectedChunkIds.size === 0) {
      toast.error("Select at least one section");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch("/api/resume/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_resume_id: selectedResumeId,
          version_name: versionName,
          job_description: jobDescription,
          selected_chunks: selectedChunks,
        }),
      });
      const data = await res.json();
      if (data.version_id) {
        setLastAtsScore(data.ats_score);
        toast.success(
          `Version saved${data.ats_score ? ` · ATS ${data.ats_score}/100` : ""}`
        );
        setVersionName("");
        setSelectedChunkIds(new Set());
        setRelevantChunkIds(new Set());
        loadVersions();
      } else {
        toast.error(data.error ?? "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <DashboardShell>
      <div className="h-full flex flex-col" style={{ background: "#F7F6F2" }}>

        {/* Page header */}
        <div
          className="px-6 py-3 shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid #E5E3DC", background: "#FFFFFF" }}
        >
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "#9B9890" }}
            >
              AI Tools
            </p>
            <h1
              className="font-display text-2xl font-semibold tracking-tight"
              style={{ color: "#111111" }}
            >
              Resume Versions
            </h1>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "#9B9890" }}>
            {savedVersions.length} version{savedVersions.length !== 1 ? "s" : ""} saved
          </span>
        </div>

        {/* 3-column workspace */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left: Controls ── */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{
              width: 272,
              borderRight: "1px solid #E5E3DC",
              background: "#FFFFFF",
            }}
          >
            <div className="p-4 space-y-4">
              {/* Resume selector */}
              <div>
                <label
                  className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5 block"
                  style={{ color: "#9B9890" }}
                >
                  Master Resume
                </label>
                {resumes.length === 0 ? (
                  <p className="text-[12px]" style={{ color: "#C8C4BB" }}>
                    No resumes yet — upload one first.
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full text-[13px] rounded-lg px-3 py-2 pr-8 appearance-none outline-none"
                      style={{
                        border: "1px solid #E5E3DC",
                        background: "#F7F6F2",
                        color: "#111111",
                      }}
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.file_name.replace(/\.pdf$/i, "")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#9B9890" }}
                    />
                  </div>
                )}
              </div>

              {/* JD textarea */}
              <div>
                <label
                  className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5 block"
                  style={{ color: "#9B9890" }}
                >
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description to surface the most relevant resume sections…"
                  rows={12}
                  className="w-full text-[12px] leading-relaxed rounded-lg px-3 py-2.5 resize-none outline-none"
                  style={{
                    border: "1px solid #E5E3DC",
                    background: "#F7F6F2",
                    color: "#111111",
                  }}
                />
              </div>

              {/* Search button */}
              <button
                onClick={searchChunks}
                disabled={searchLoading || !jobDescription.trim() || !selectedResumeId}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: "#06b6d4" }}
              >
                {searchLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={13} strokeWidth={2} />
                )}
                {searchLoading ? "Searching…" : "Find Relevant Sections"}
              </button>

              {relevantChunkIds.size > 0 && (
                <button
                  onClick={() => {
                    setRelevantChunkIds(new Set());
                    setSelectedChunkIds(new Set());
                    setAllChunks((prev) =>
                      prev.map((c) => ({ ...c, similarity: undefined }))
                    );
                  }}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-medium transition-opacity"
                  style={{ color: "#9B9890", border: "1px solid #E5E3DC" }}
                >
                  <RotateCcw size={11} />
                  Clear Search
                </button>
              )}
            </div>
          </div>

          {/* ── Middle: Chunks ── */}
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ background: "#F7F6F2" }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[10px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "#9B9890" }}
              >
                {relevantChunkIds.size > 0
                  ? `${relevantChunkIds.size} relevant · ${allChunks.length} total`
                  : `${allChunks.length} section${allChunks.length !== 1 ? "s" : ""}`}
              </p>
              {selectedChunkIds.size > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: "#06b6d4" }}
                >
                  {selectedChunkIds.size} selected
                </span>
              )}
            </div>

            {chunksLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : allChunks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center rounded-xl"
                style={{ border: "1px dashed #E5E3DC", background: "#FFFFFF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                >
                  <Layers size={18} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "#111111" }}>
                  No sections yet
                </p>
                <p
                  className="text-[12px] mb-5 max-w-[200px] leading-relaxed"
                  style={{ color: "#9B9890" }}
                >
                  {selectedResume
                    ? "Generate semantic sections from this resume to start building versions."
                    : "Select a resume to get started."}
                </p>
                {selectedResume && (
                  <button
                    onClick={generateChunks}
                    disabled={generatingChunks}
                    className="inline-flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
                    style={{ background: "#06b6d4" }}
                  >
                    {generatingChunks && (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {generatingChunks ? "Generating…" : "Generate Sections"}
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                {sortedChunks.map((chunk, i) => {
                  const isSelected = selectedChunkIds.has(chunk.id);
                  const isRelevant = relevantChunkIds.has(chunk.id);
                  const colors = BADGE[chunk.chunk_type] ?? BADGE.summary;

                  return (
                    <motion.div
                      key={chunk.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.2, ease: EASE }}
                      onClick={() => toggleChunk(chunk.id)}
                      className="rounded-xl p-3.5 cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? "#ECFEFF" : "#FFFFFF",
                        border: `1px solid ${isSelected ? "#06b6d4" : "#E5E3DC"}`,
                        outline: isSelected ? "2px solid #06b6d4" : "none",
                        outlineOffset: "-1px",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center"
                          style={{
                            background: isSelected ? "#06b6d4" : "#F7F6F2",
                            border: `1px solid ${isSelected ? "#06b6d4" : "#D1D5DB"}`,
                          }}
                        >
                          {isSelected && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path
                                d="M1 4l2 2 4-4"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                              style={{
                                background: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {chunk.chunk_type}
                            </span>
                            {isRelevant && (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                                style={{
                                  background: "#F0FDFA",
                                  color: "#0D9488",
                                  border: "1px solid #99F6E4",
                                }}
                              >
                                Relevant
                              </span>
                            )}
                            {chunk.similarity !== undefined && (
                              <span
                                className="text-[10px] font-mono ml-auto"
                                style={{ color: "#9B9890" }}
                              >
                                {Math.round(chunk.similarity * 100)}%
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[12px] leading-relaxed line-clamp-3"
                            style={{ color: "#111111" }}
                          >
                            {chunk.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Saved versions list (accessible by scrolling) */}
            {savedVersions.length > 0 && (
              <div className="mt-8">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3"
                  style={{ color: "#9B9890" }}
                >
                  Saved Versions
                </p>
                <div className="space-y-2">
                  {savedVersions.map((v) => {
                    const parent = resumes.find((r) => r.id === v.parent_resume_id);
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                        >
                          <FileText size={12} style={{ color: "#9B9890" }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{ color: "#111111" }}
                          >
                            {v.version_name}
                          </p>
                          <p
                            className="text-[11px] font-mono truncate"
                            style={{ color: "#9B9890" }}
                          >
                            {parent?.file_name?.replace(/\.pdf$/i, "") ?? "—"} ·{" "}
                            {new Date(v.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {v.ats_score !== null && v.ats_score > 0 && (
                          <span
                            className="text-sm font-bold tabular-nums shrink-0"
                            style={{ color: scoreColor(v.ats_score) }}
                          >
                            {v.ats_score}
                            <span
                              className="text-[10px] font-normal"
                              style={{ color: "#C8C4BB" }}
                            >
                              /100
                            </span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Preview + Save ── */}
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: 320,
              borderLeft: "1px solid #E5E3DC",
              background: "#FFFFFF",
            }}
          >
            {/* Preview header */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid #E5E3DC" }}
            >
              <p
                className="text-[10px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "#9B9890" }}
              >
                Version Preview
              </p>
              {selectedChunkIds.size > 0 && (
                <p className="text-[11px] mt-0.5" style={{ color: "#C8C4BB" }}>
                  {selectedChunkIds.size} section{selectedChunkIds.size !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-y-auto p-4">
              {previewContent ? (
                <pre
                  className="text-[11px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: "#111111", fontFamily: "inherit" }}
                >
                  {previewContent}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                  >
                    <FileText size={15} style={{ color: "#C8C4BB" }} strokeWidth={1.5} />
                  </div>
                  <p className="text-[12px]" style={{ color: "#C8C4BB" }}>
                    Select sections to preview the assembled resume
                  </p>
                </div>
              )}
            </div>

            {/* Save section */}
            <div
              className="p-4 space-y-3 shrink-0"
              style={{ borderTop: "1px solid #E5E3DC" }}
            >
              <div>
                <label
                  className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5 block"
                  style={{ color: "#9B9890" }}
                >
                  Version Name
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveVersion()}
                  placeholder="e.g. Frontend Role v2"
                  className="w-full text-[13px] rounded-lg px-3 py-2 outline-none"
                  style={{
                    border: "1px solid #E5E3DC",
                    background: "#F7F6F2",
                    color: "#111111",
                  }}
                />
              </div>

              <button
                onClick={saveVersion}
                disabled={saveLoading || !versionName.trim() || selectedChunkIds.size === 0}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: "#111111" }}
              >
                {saveLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={13} strokeWidth={2} />
                )}
                {saveLoading ? "Saving…" : "Save Version"}
              </button>

              {lastAtsScore !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                >
                  <span className="text-[11px]" style={{ color: "#9B9890" }}>
                    ATS Score
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: scoreColor(lastAtsScore) }}
                  >
                    {lastAtsScore}
                    <span className="text-[10px] font-normal" style={{ color: "#C8C4BB" }}>
                      /100
                    </span>
                  </span>
                </motion.div>
              )}

              {selectedChunkIds.size > 0 && !saveLoading && (
                <p className="text-[10px] text-center" style={{ color: "#C8C4BB" }}>
                  ATS score calculated on save
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
