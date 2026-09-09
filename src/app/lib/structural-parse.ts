// Client for the optional python-ingest service (see python-ingest/README.md).
//
// When STRUCTURAL_PARSE_URL is set, the upload path sends the raw resume file
// here and gets back docling-quality structural chunks (headings, tables, page
// numbers, confidence) that make much better retrieval chunks than pdf-parse
// text. When it's unset / down / errors, this returns null and the caller falls
// back to the text-only chunker - no behaviour change.

export interface StructuralChunk {
  /** Body text only - NO breadcrumb prefix; chunking.ts adds one. */
  text: string;
  headers: string[];
  is_table: boolean;
  page_number: number | null;
  confidence: number;
}

export interface ParsedStructural {
  chunks: StructuralChunk[];
  /** docling's own 0-1 quality grade for the source doc (mean over pages).
   *  Low values are the signal to try the Gemini vision fallback. */
  sourceConfidence: number;
}

const TIMEOUT_MS = 45_000; // docling cold-parses can take a few seconds

export function structuralParseEnabled(): boolean {
  return !!process.env.STRUCTURAL_PARSE_URL;
}

export async function parseStructured(
  buffer: Buffer,
  filename: string
): Promise<ParsedStructural | null> {
  const base = process.env.STRUCTURAL_PARSE_URL;
  if (!base) return null;

  try {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buffer)]), filename);

    const headers: Record<string, string> = {};
    if (process.env.STRUCTURAL_PARSE_TOKEN) {
      headers["X-Parse-Token"] = process.env.STRUCTURAL_PARSE_TOKEN;
    }

    const res = await fetch(`${base.replace(/\/$/, "")}/parse`, {
      method: "POST",
      headers,
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[structural-parse] HTTP ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      chunks?: unknown;
      source_confidence?: unknown;
    };
    const chunks = Array.isArray(data.chunks) ? (data.chunks as StructuralChunk[]) : [];
    const valid = chunks.filter(
      (c) => c && typeof c.text === "string" && c.text.trim().length > 0
    );
    if (!valid.length) return null;

    const sourceConfidence =
      typeof data.source_confidence === "number" ? data.source_confidence : 0.5;
    return { chunks: valid, sourceConfidence };
  } catch (err) {
    console.error("[structural-parse] failed (non-fatal):", err);
    return null;
  }
}
