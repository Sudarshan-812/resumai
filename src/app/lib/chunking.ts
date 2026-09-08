import { createClient } from "@/app/lib/supabase/server";
import { getBatchEmbeddings, EMBEDDING_MODEL } from "@/app/lib/embedding";
import type { StructuralChunk } from "@/app/lib/structural-parse";
import "@/env";

type ChunkType = "summary" | "experience" | "education" | "skills" | "project";

interface RawChunk {
  content: string;
  chunk_type: ChunkType;
  /** The actual section-heading line from the resume, if this chunk came from
   *  header-based splitting. Prepended to the embedded text as a breadcrumb so
   *  a bullet retrieved in isolation still carries its section context. */
  header: string | null;
  /** Extras present only when the chunk came from the structural parser. */
  meta?: { is_table?: boolean; confidence?: number; page_number?: number | null };
}

// Chunk-size controls (chars). Ported from Cortex's structural chunker.
const MAX_CHUNK_CHARS = 1_800; // split anything larger, keeping the same heading
const MIN_MERGE_CHARS = 220; // fold a tiny chunk into the previous same-type one

const SECTION_MAP: Array<{ keywords: string[]; type: ChunkType }> = [
  {
    keywords: [
      "summary", "objective", "profile", "about me", "overview",
      "introduction", "professional statement", "career summary",
      "professional profile", "career objective",
    ],
    type: "summary",
  },
  {
    keywords: [
      "experience", "employment", "work history", "professional experience",
      "career history", "work experience", "positions", "career",
      "internship", "internships",
    ],
    type: "experience",
  },
  {
    keywords: [
      "education", "academic", "qualifications", "degrees",
      "university", "college", "school", "academic background",
      "educational background", "certifications", "courses",
    ],
    type: "education",
  },
  {
    keywords: [
      "skills", "technologies", "competencies", "technical skills",
      "core competencies", "tech stack", "tools", "expertise",
      "languages", "frameworks", "proficiencies", "strengths",
      "programming", "software",
    ],
    type: "skills",
  },
  {
    keywords: [
      "projects", "portfolio", "personal projects", "open source",
      "side projects", "key projects", "project experience",
      "notable projects", "selected projects",
    ],
    type: "project",
  },
];

function isSectionHeader(line: string): ChunkType | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return null;

  const cleaned = trimmed.replace(/[\s\-_=:•|*]+$/g, "").trim();
  if (!cleaned || cleaned.length < 3) return null;

  const lower = cleaned.toLowerCase().replace(/[^a-z\s&]/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = lower.split(" ").filter(Boolean).length;
  if (wordCount === 0 || wordCount > 5) return null;

  for (const section of SECTION_MAP) {
    if (section.keywords.some((k) => lower === k || lower.startsWith(k) || lower.includes(k))) {
      return section.type;
    }
  }
  return null;
}

/** Map a structural parser's heading path to a resume section type. */
function classifyByHeader(headers: string[]): ChunkType | null {
  const joined = headers.filter(Boolean).join(" ").toLowerCase();
  if (!joined) return null;
  for (const section of SECTION_MAP) {
    if (section.keywords.some((k) => joined.includes(k))) return section.type;
  }
  return null;
}

// ── Strategy 1: split on explicit section headers ──────────────────────────

function splitBySections(resumeText: string): RawChunk[] {
  const lines = resumeText.split("\n");
  const sections: RawChunk[] = [];

  let current: RawChunk = { content: "", chunk_type: "summary", header: null };
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inSection) current.content += "\n";
      continue;
    }

    const sectionType = isSectionHeader(trimmed);
    if (sectionType) {
      if (inSection && current.content.trim().length > 20) {
        sections.push({ ...current, content: current.content.trim() });
      }
      current = { content: trimmed + "\n", chunk_type: sectionType, header: trimmed };
      inSection = true;
    } else {
      if (!inSection) {
        current.chunk_type = "summary";
        inSection = true;
      }
      current.content += line + "\n";
    }
  }

  if (inSection && current.content.trim().length > 20) {
    sections.push({ ...current, content: current.content.trim() });
  }

  return sections;
}

// ── Strategy 2: paragraph-based fallback ──────────────────────────────────

function guessChunkType(text: string): ChunkType {
  const lower = text.toLowerCase();
  if (/university|college|bachelor|master|degree|gpa|graduation|certified/.test(lower))
    return "education";
  if (
    /javascript|python|typescript|java|react|node|vue|angular|sql|docker|kubernetes|aws|gcp|azure|html|css|api|linux/
      .test(lower)
  )
    return "skills";
  if (
    /\b(led|built|developed|implemented|managed|designed|created|increased|reduced|launched|shipped|architected|drove)\b/
      .test(lower)
  )
    return "experience";
  if (/\b(project|github|deployed|repository|app|website|dashboard|open.?source)\b/.test(lower))
    return "project";
  return "summary";
}

function splitByParagraphs(resumeText: string): RawChunk[] {
  return resumeText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30)
    .map((para) => ({ content: para, chunk_type: guessChunkType(para), header: null }));
}

// ── Strategy 3: fixed line-group fallback ─────────────────────────────────

function splitByLineGroups(resumeText: string): RawChunk[] {
  const lines = resumeText.split("\n").filter((l) => l.trim().length > 0);
  const groupSize = Math.max(5, Math.ceil(lines.length / 6));
  const chunks: RawChunk[] = [];

  for (let i = 0; i < lines.length; i += groupSize) {
    const content = lines.slice(i, i + groupSize).join("\n").trim();
    if (content.length > 20) {
      chunks.push({ content, chunk_type: guessChunkType(content), header: null });
    }
  }

  return chunks;
}

// ── Post-processing: oversize split + small-chunk merge + breadcrumb ──────

/** Break a chunk longer than MAX_CHUNK_CHARS into smaller pieces on paragraph
 *  (then line) boundaries, each keeping the parent's type and heading. */
function splitOversized(chunk: RawChunk): RawChunk[] {
  if (chunk.content.length <= MAX_CHUNK_CHARS) return [chunk];

  const units = chunk.content.includes("\n\n")
    ? chunk.content.split(/\n{2,}/)
    : chunk.content.split("\n");

  const out: RawChunk[] = [];
  let buf = "";
  const push = () => {
    if (buf.trim()) out.push({ ...chunk, content: buf.trim() });
    buf = "";
  };
  for (const u of units) {
    if (buf && buf.length + u.length + 1 > MAX_CHUNK_CHARS) push();
    buf = buf ? `${buf}\n${u}` : u;
    if (buf.length >= MAX_CHUNK_CHARS) push();
  }
  push();
  return out.length ? out : [chunk];
}

/** Fold a chunk shorter than MIN_MERGE_CHARS into the previous chunk when they
 *  share a type and the result still fits MAX_CHUNK_CHARS. */
function mergeSmall(chunks: RawChunk[]): RawChunk[] {
  const merged: RawChunk[] = [];
  for (const ck of chunks) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.chunk_type === ck.chunk_type &&
      prev.header === ck.header &&
      !prev.meta?.is_table &&
      !ck.meta?.is_table &&
      prev.content.length < MIN_MERGE_CHARS &&
      prev.content.length + ck.content.length + 1 <= MAX_CHUNK_CHARS
    ) {
      merged[merged.length - 1] = {
        ...prev,
        content: `${prev.content}\n${ck.content}`.trim(),
      };
    } else {
      merged.push(ck);
    }
  }
  return merged;
}

/** Prepend a `[Context: <heading>]` breadcrumb so an isolated bullet keeps its
 *  section context in the embedding and in retrieved output. */
function withBreadcrumb(chunk: RawChunk): string {
  const label = (chunk.header || chunk.chunk_type).toUpperCase();
  return `[Context: ${label}]\n\n${chunk.content}`.trim();
}

// ── Entry point ────────────────────────────────────────────────────────────

function splitIntoChunks(resumeText: string): RawChunk[] {
  let raw = splitBySections(resumeText);
  if (raw.length < 2) raw = splitByParagraphs(resumeText);
  if (raw.length < 1) raw = splitByLineGroups(resumeText);
  if (raw.length < 1) {
    raw = [{ content: resumeText.slice(0, 8000).trim(), chunk_type: "summary", header: null }];
  }

  return mergeSmall(raw.flatMap(splitOversized));
}

/** Convert structural-parser output into RawChunks (Strategy 0 - preferred when
 *  the python-ingest service is enabled). Section type comes from the heading
 *  path, falling back to content heuristics. */
function structuralToChunks(structural: StructuralChunk[]): RawChunk[] {
  const raw: RawChunk[] = structural
    .map((c) => ({
      content: c.text.trim(),
      chunk_type: classifyByHeader(c.headers) ?? guessChunkType(c.text),
      header: c.headers.filter(Boolean).join(" > ") || null,
      meta: {
        is_table: c.is_table,
        confidence: c.confidence,
        page_number: c.page_number,
      },
    }))
    .filter((c) => c.content.length > 20);

  return mergeSmall(raw.flatMap(splitOversized));
}

// ── Public export ──────────────────────────────────────────────────────────

export async function chunkAndEmbedResume(
  resumeId: string,
  resumeText: string,
  userId: string,
  structural?: StructuralChunk[] | null
): Promise<{ chunks_stored: number; error?: string }> {
  const supabase = await createClient();

  const usedStructural = !!structural?.length;
  const chunks = usedStructural
    ? structuralToChunks(structural!)
    : splitIntoChunks(resumeText);
  if (chunks.length === 0) {
    return { chunks_stored: 0, error: "No sections could be extracted from this resume." };
  }

  // Embed the breadcrumbed text so section context is baked into the vector.
  const embedTexts = chunks.map(withBreadcrumb);

  let embeddings: (number[] | null)[];
  try {
    embeddings = await getBatchEmbeddings(embedTexts, "RETRIEVAL_DOCUMENT");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chunking] batch embed error:", msg);
    return { chunks_stored: 0, error: msg };
  }

  const rows = chunks
    .map((chunk, i) => ({
      user_id: userId,
      resume_id: resumeId,
      // Store the breadcrumbed text so retrieval output carries the heading too.
      content: embedTexts[i],
      chunk_type: chunk.chunk_type,
      embedding: embeddings[i] ? `[${embeddings[i]!.join(",")}]` : null,
      embedding_model: EMBEDDING_MODEL,
      metadata: {
        chars: chunk.content.length,
        header: chunk.header,
        headers: [chunk.chunk_type],
        source: usedStructural ? "structural" : "text",
        ...(chunk.meta?.is_table != null ? { is_table: chunk.meta.is_table } : {}),
        ...(chunk.meta?.confidence != null ? { confidence: chunk.meta.confidence } : {}),
        ...(chunk.meta?.page_number != null ? { page_number: chunk.meta.page_number } : {}),
      },
    }))
    .filter((row) => row.embedding !== null);

  if (rows.length === 0) {
    return { chunks_stored: 0, error: "All embeddings failed - no chunks stored." };
  }

  // Snapshot old IDs, insert new rows first, then delete old ones - old chunks
  // are never lost if the insert fails.
  const { data: oldChunks } = await supabase
    .from("resume_chunks")
    .select("id")
    .eq("resume_id", resumeId)
    .eq("user_id", userId);

  const oldIds = (oldChunks ?? []).map((c) => c.id as string);

  // Insert with embedding_model; fall back without it if migration 002 hasn't
  // been applied yet (matches the calculated_yoe pattern in upload-resume.ts).
  let insertError = (await supabase.from("resume_chunks").insert(rows)).error;
  if (insertError && /embedding_model/.test(insertError.message)) {
    const legacyRows = rows.map(({ embedding_model, ...rest }) => {
      void embedding_model;
      return rest;
    });
    insertError = (await supabase.from("resume_chunks").insert(legacyRows)).error;
  }

  if (insertError) {
    console.error("[chunking] insert error:", insertError.message);
    return { chunks_stored: 0, error: insertError.message };
  }

  if (oldIds.length > 0) {
    await supabase.from("resume_chunks").delete().in("id", oldIds);
  }

  return { chunks_stored: rows.length };
}
