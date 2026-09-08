// Gemini text embeddings for resume retrieval.
//
// Model: gemini-embedding-001, output truncated to 768 dims (Matryoshka
// Representation Learning) so it drops into the existing `vector(768)` column
// while keeping near-full quality at 1/4 the storage. `embedding-001` (the
// previous model this file used) is legacy; every new vector is written with
// EMBEDDING_MODEL and tracked in resume_chunks.embedding_model.
//
// taskType materially changes the vector: index chunks as RETRIEVAL_DOCUMENT,
// embed the search query as RETRIEVAL_QUERY.

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001";

/** Current embedding model id. Stored per row so a future swap can't silently
 *  degrade search (mismatched rows are re-embedded by scripts/reembed-resume-chunks.mjs). */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIM = 768;

export type EmbedTaskType =
  | "RETRIEVAL_QUERY"
  | "RETRIEVAL_DOCUMENT"
  | "SEMANTIC_SIMILARITY";

const MAX_INPUT_CHARS = 8_000;
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST with exponential backoff + jitter on 429/5xx and transient network errors. */
async function postWithRetry(url: string, body: unknown): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify(body),
      });
      if (res.ok || !RETRYABLE.has(res.status) || attempt === MAX_RETRIES) {
        return res;
      }
      lastErr = new Error(`embedding HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES) throw err;
    }
    await sleep(400 * 2 ** attempt + Math.random() * 250);
  }
  throw lastErr instanceof Error ? lastErr : new Error("embedding request failed");
}

function toRequest(text: string, taskType: EmbedTaskType) {
  return {
    model: "models/gemini-embedding-001",
    content: { parts: [{ text: text.slice(0, MAX_INPUT_CHARS) }] },
    taskType,
    outputDimensionality: EMBEDDING_DIM,
  };
}

/** Single embedding. Defaults to query-side task type. */
export async function getEmbedding(
  text: string,
  taskType: EmbedTaskType = "RETRIEVAL_QUERY"
): Promise<number[]> {
  const res = await postWithRetry(`${GEMINI_BASE}:embedContent`, toRequest(text, taskType));
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const values = data?.embedding?.values as number[] | undefined;
  if (!values?.length) throw new Error("embedding response had no values");
  return values.slice(0, EMBEDDING_DIM);
}

/** Batch embeddings. Defaults to document-side task type (used when indexing chunks). */
export async function getBatchEmbeddings(
  texts: string[],
  taskType: EmbedTaskType = "RETRIEVAL_DOCUMENT"
): Promise<(number[] | null)[]> {
  if (texts.length === 0) return [];

  const res = await postWithRetry(`${GEMINI_BASE}:batchEmbedContents`, {
    requests: texts.map((t) => toRequest(t, taskType)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));

  return (data.embeddings as Array<{ values: number[] } | null>).map(
    (e) => e?.values?.slice(0, EMBEDDING_DIM) ?? null
  );
}
