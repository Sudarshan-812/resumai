/**
 * One-off backfill: re-embed every resume_chunks row that was not created with
 * the current embedding model (gemini-embedding-001 @ 768 dims).
 *
 * Rows embedded with two different models cannot be compared by cosine distance,
 * so after applying supabase/migrations/002_hybrid_search_and_embedding_model.sql
 * you must run this once before hybrid search is trustworthy.
 *
 * Idempotent. Safe to re-run (it only touches rows whose embedding_model differs).
 *
 * Requires in the environment (reads .env.local automatically if present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY
 *
 * Usage:
 *   node scripts/reembed-resume-chunks.mjs
 *   node scripts/reembed-resume-chunks.mjs --dry-run
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env.local loader (no dependency) --------------------------------
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env.local - rely on the real environment */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_API_KEY) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY."
  );
  process.exit(1);
}

const MODEL = "gemini-embedding-001";
const DIM = 768;
const PAGE = 100;
const EMBED_CONCURRENCY = 4;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function embed(text) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        body: JSON.stringify({
          model: `models/${MODEL}`,
          content: { parts: [{ text: String(text).slice(0, 8000) }] },
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: DIM,
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.embedding.values.slice(0, DIM);
    }
    if (![408, 429, 500, 502, 503, 504].includes(res.status)) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }
    await sleep(500 * 2 ** attempt + Math.random() * 300);
  }
  throw new Error("embedding failed after retries");
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    })
  );
  return out;
}

let processed = 0;
let updated = 0;

for (;;) {
  const { data: rows, error } = await supabase
    .from("resume_chunks")
    .select("id, content, embedding_model")
    .or(`embedding_model.neq.${MODEL},embedding_model.is.null`)
    .limit(PAGE);

  if (error) {
    console.error("query failed:", error.message);
    process.exit(1);
  }
  if (!rows || rows.length === 0) break;

  const vectors = await mapLimit(rows, EMBED_CONCURRENCY, (r) => embed(r.content));

  if (!DRY_RUN) {
    for (let k = 0; k < rows.length; k++) {
      const { error: upErr } = await supabase
        .from("resume_chunks")
        .update({ embedding: `[${vectors[k].join(",")}]`, embedding_model: MODEL })
        .eq("id", rows[k].id);
      if (upErr) {
        console.error(`update ${rows[k].id} failed:`, upErr.message);
        process.exit(1);
      }
      updated++;
    }
  }

  processed += rows.length;
  console.log(`${DRY_RUN ? "[dry-run] " : ""}processed ${processed} (updated ${updated})`);

  if (DRY_RUN) break; // one page is enough to preview
}

console.log(
  DRY_RUN
    ? `Dry run complete. ${processed} rows need re-embedding (showed first page).`
    : `Done. Re-embedded ${updated} chunk(s) with ${MODEL}.`
);
