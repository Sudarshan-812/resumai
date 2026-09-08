// Retrieval pipeline shared by the Resume Copilot chat and the Versions
// "find relevant" flow:
//
//   embed -> hybrid search (dense + BM25 + RRF)  [migration 002]
//         -> LLM rerank (cross-encoder-style scoring)
//         -> Corrective RAG (grade; if weak, one query rewrite + re-retrieve)
//
// Every LLM step is best-effort and time-boxed: on failure or timeout it falls
// back to the previous stage's result, so retrieval never blocks or throws.
// Ported in spirit from Cortex's RAGOrchestrator.

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getEmbedding } from "@/app/lib/embedding";
import type { createClient } from "@/app/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

/** Cheap/fast model for rerank + CRAG grading. A bad id here degrades to
 *  fusion order (rerank) / "answer as-is" (CRAG) rather than erroring. */
const RETRIEVAL_MODEL = "gemini-2.5-flash-lite";
const LLM_TIMEOUT_MS = 4_000;
const CRAG_MEAN_THRESHOLD = 0.6;

export interface RetrievedChunk {
  id: string;
  content: string;
  chunk_type: string;
  similarity: number;
}
export interface RankedChunk extends RetrievedChunk {
  /** 0-1 relevance from the reranker (or carried-over fusion score on fallback). */
  rerankScore: number;
}

// ── Hybrid search (RPC, with graceful fallback to the pure-cosine RPC) ─────

export async function hybridSearch(
  supabase: Supa,
  opts: {
    userId: string;
    resumeId?: string | null;
    query: string;
    queryEmbedding: number[];
    matchCount: number;
  }
): Promise<RetrievedChunk[]> {
  const embeddingStr = `[${opts.queryEmbedding.join(",")}]`;
  const args = {
    query_embedding: embeddingStr,
    query_text: opts.query,
    match_user_id: opts.userId,
    match_resume_id: opts.resumeId ?? null,
    match_count: opts.matchCount,
  };

  let { data, error } = await supabase.rpc("search_resume_chunks_hybrid", args);
  if (error && /hybrid|does not exist/i.test(error.message)) {
    ({ data, error } = await supabase.rpc("search_resume_chunks", args));
  }
  if (error || !Array.isArray(data)) return [];
  return (data as RetrievedChunk[]).map((c) => ({
    id: c.id,
    content: c.content,
    chunk_type: c.chunk_type,
    similarity: Number(c.similarity ?? 0),
  }));
}

// ── LLM reranker ─────────────────────────────────────────────────────────

const RerankSchema = z.object({
  rankings: z.array(z.object({ index: z.number().int(), score: z.number() })),
});

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export async function rerankChunks(
  query: string,
  chunks: RetrievedChunk[],
  topN: number
): Promise<RankedChunk[]> {
  if (chunks.length <= 1) {
    return chunks.slice(0, topN).map((c) => ({ ...c, rerankScore: clamp01(c.similarity) }));
  }
  const fallback = (): RankedChunk[] =>
    chunks.slice(0, topN).map((c, i) => ({
      ...c,
      rerankScore: chunks.length > 1 ? 1 - i / chunks.length : 1,
    }));

  try {
    const passages = chunks
      .map((c, i) => `[${i}] ${c.content.slice(0, 600)}`)
      .join("\n\n");
    const { object } = await generateObject({
      model: google(RETRIEVAL_MODEL),
      schema: RerankSchema,
      temperature: 0,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
      system:
        "You are a passage reranker. Score each passage 0.0-1.0 for how directly it answers the query. Return every passage index exactly once.",
      prompt: `Query: ${query}\n\nPassages:\n${passages}`,
    });

    const scored = object.rankings
      .filter((r) => Number.isInteger(r.index) && r.index >= 0 && r.index < chunks.length)
      .map((r) => ({ index: r.index, score: clamp01(r.score) }))
      .sort((a, b) => b.score - a.score);

    const seen = new Set<number>();
    const ranked: RankedChunk[] = [];
    for (const { index, score } of scored) {
      if (seen.has(index)) continue;
      seen.add(index);
      ranked.push({ ...chunks[index], rerankScore: score, similarity: score });
      if (ranked.length >= topN) break;
    }
    return ranked.length ? ranked : fallback();
  } catch {
    return fallback();
  }
}

// ── Corrective RAG: grade, and on a weak set do one query rewrite ─────────

const CragSchema = z.object({
  grades: z.array(z.object({ index: z.number().int(), relevance: z.number() })),
  rewritten_query: z.string().optional(),
});

async function cragEvaluate(
  query: string,
  ranked: RankedChunk[]
): Promise<{ ok: boolean; rewrittenQuery?: string }> {
  if (ranked.length === 0) return { ok: false };
  try {
    const body = ranked.map((c, i) => `[${i}] ${c.content.slice(0, 600)}`).join("\n\n");
    const { object } = await generateObject({
      model: google(RETRIEVAL_MODEL),
      schema: CragSchema,
      temperature: 0,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
      system:
        "You grade retrieved context for a resume Q&A assistant. Score each chunk 0.0-1.0 for how well it helps answer the user's question. If the set is weak overall, also give one sharper standalone search query.",
      prompt: `Question: ${query}\n\nChunks:\n${body}`,
    });
    const rels = object.grades
      .filter((g) => g.index >= 0 && g.index < ranked.length)
      .map((g) => clamp01(g.relevance));
    const mean = rels.length ? rels.reduce((a, b) => a + b, 0) / rels.length : 0;
    if (mean >= CRAG_MEAN_THRESHOLD) return { ok: true };
    const rq = object.rewritten_query?.trim();
    return { ok: false, rewrittenQuery: rq && rq.length > 3 ? rq : undefined };
  } catch {
    return { ok: true }; // grading failed -> proceed with what we have
  }
}

// ── High-level entry points ─────────────────────────────────────────────

/** Question-shaped query (Resume Copilot): hybrid -> rerank -> CRAG (one rewrite). */
export async function retrieveForQuestion(
  supabase: Supa,
  opts: { userId: string; resumeId: string; question: string; topN?: number }
): Promise<{ chunks: RankedChunk[]; note: string }> {
  const topN = opts.topN ?? 6;
  if (!opts.question.trim()) return { chunks: [], note: "" };

  let embedding: number[];
  try {
    embedding = await getEmbedding(opts.question, "RETRIEVAL_QUERY");
  } catch {
    return { chunks: [], note: "" };
  }

  const candidates = await hybridSearch(supabase, {
    userId: opts.userId,
    resumeId: opts.resumeId,
    query: opts.question,
    queryEmbedding: embedding,
    matchCount: topN * 2,
  });
  if (candidates.length === 0) return { chunks: [], note: "" };

  let ranked = await rerankChunks(opts.question, candidates, topN);
  const verdict = await cragEvaluate(opts.question, ranked);

  if (!verdict.ok && verdict.rewrittenQuery) {
    try {
      const rqEmbedding = await getEmbedding(verdict.rewrittenQuery, "RETRIEVAL_QUERY");
      const more = await hybridSearch(supabase, {
        userId: opts.userId,
        resumeId: opts.resumeId,
        query: verdict.rewrittenQuery,
        queryEmbedding: rqEmbedding,
        matchCount: topN * 2,
      });
      if (more.length) {
        ranked = await rerankChunks(verdict.rewrittenQuery, more, topN);
        return { chunks: ranked, note: `expanded search: "${verdict.rewrittenQuery}"` };
      }
    } catch {
      /* keep the original ranked set */
    }
  }

  return { chunks: ranked, note: "" };
}

/** JD-shaped query (Versions "find relevant"): hybrid -> rerank, no CRAG. */
export async function retrieveForJD(
  supabase: Supa,
  opts: { userId: string; resumeId?: string | null; jd: string; topN?: number }
): Promise<RankedChunk[]> {
  const topN = opts.topN ?? 8;
  if (!opts.jd.trim()) return [];

  let embedding: number[];
  try {
    embedding = await getEmbedding(opts.jd, "RETRIEVAL_QUERY");
  } catch {
    return [];
  }

  const candidates = await hybridSearch(supabase, {
    userId: opts.userId,
    resumeId: opts.resumeId ?? null,
    query: opts.jd,
    queryEmbedding: embedding,
    matchCount: Math.max(topN * 2, 12),
  });
  if (candidates.length === 0) return [];
  return rerankChunks(opts.jd, candidates, topN);
}
