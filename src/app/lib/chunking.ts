import { createClient } from "@/app/lib/supabase/server";
import { getBatchEmbeddings } from "@/app/lib/embedding";
import "@/env";

type ChunkType = "summary" | "experience" | "education" | "skills" | "project";

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

// ── Strategy 1: split on explicit section headers ──────────────────────────

function splitBySections(
  resumeText: string
): Array<{ content: string; chunk_type: ChunkType }> {
  const lines = resumeText.split("\n");
  const sections: Array<{ content: string; chunk_type: ChunkType }> = [];

  let current: { content: string; chunk_type: ChunkType } = {
    content: "",
    chunk_type: "summary",
  };
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
        sections.push({ content: current.content.trim(), chunk_type: current.chunk_type });
      }
      current = { content: trimmed + "\n", chunk_type: sectionType };
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
    sections.push({ content: current.content.trim(), chunk_type: current.chunk_type });
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

function splitByParagraphs(
  resumeText: string
): Array<{ content: string; chunk_type: ChunkType }> {
  const paragraphs = resumeText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  return paragraphs.map((para) => ({
    content: para,
    chunk_type: guessChunkType(para),
  }));
}

// ── Strategy 3: fixed line-group fallback ─────────────────────────────────

function splitByLineGroups(
  resumeText: string
): Array<{ content: string; chunk_type: ChunkType }> {
  const lines = resumeText.split("\n").filter((l) => l.trim().length > 0);
  const groupSize = Math.max(5, Math.ceil(lines.length / 6));
  const chunks: Array<{ content: string; chunk_type: ChunkType }> = [];

  for (let i = 0; i < lines.length; i += groupSize) {
    const content = lines.slice(i, i + groupSize).join("\n").trim();
    if (content.length > 20) {
      chunks.push({ content, chunk_type: guessChunkType(content) });
    }
  }

  return chunks;
}

// ── Entry point ────────────────────────────────────────────────────────────

function splitIntoChunks(
  resumeText: string
): Array<{ content: string; chunk_type: ChunkType }> {
  const bySections = splitBySections(resumeText);
  if (bySections.length >= 2) return bySections;

  const byParagraphs = splitByParagraphs(resumeText);
  if (byParagraphs.length >= 2) return byParagraphs;

  const byLines = splitByLineGroups(resumeText);
  if (byLines.length >= 1) return byLines;

  return [{ content: resumeText.slice(0, 8000).trim(), chunk_type: "summary" }];
}

// ── Public export ──────────────────────────────────────────────────────────

export async function chunkAndEmbedResume(
  resumeId: string,
  resumeText: string,
  userId: string
): Promise<{ chunks_stored: number; error?: string }> {
  const supabase = await createClient();

  const chunks = splitIntoChunks(resumeText);

  if (chunks.length === 0) {
    return { chunks_stored: 0, error: "No sections could be extracted from this resume." };
  }

  // Issue 9: Single batch API call for all embeddings instead of N individual calls
  let embeddings: (number[] | null)[];
  try {
    embeddings = await getBatchEmbeddings(chunks.map((c) => c.content));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chunking] batch embed error:", msg);
    return { chunks_stored: 0, error: msg };
  }

  const rows = chunks
    .map((chunk, i) => ({
      user_id: userId,
      resume_id: resumeId,
      content: chunk.content,
      chunk_type: chunk.chunk_type,
      embedding: embeddings[i] ? `[${embeddings[i]!.join(",")}]` : null,
      metadata: { length: chunk.content.length },
    }))
    .filter((row) => row.embedding !== null);

  if (rows.length === 0) {
    return { chunks_stored: 0, error: "All embeddings failed — no chunks stored." };
  }

  // Issue 10: Snapshot old IDs, insert new rows first, then delete old ones.
  // This ensures old chunks are never lost if the insert fails.
  const { data: oldChunks } = await supabase
    .from("resume_chunks")
    .select("id")
    .eq("resume_id", resumeId)
    .eq("user_id", userId);

  const oldIds = (oldChunks ?? []).map((c) => c.id as string);

  const { error: insertError } = await supabase.from("resume_chunks").insert(rows);

  if (insertError) {
    console.error("[chunking] insert error:", insertError.message);
    return { chunks_stored: 0, error: insertError.message };
  }

  // Only delete old chunks after successful insert — preserves data on failure
  if (oldIds.length > 0) {
    await supabase.from("resume_chunks").delete().in("id", oldIds);
  }

  return { chunks_stored: rows.length };
}
