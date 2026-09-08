# scripts

One-off / operational scripts. Not part of the Next.js build.

## reembed-resume-chunks.mjs

Backfill for **migration 002** (`supabase/migrations/002_hybrid_search_and_embedding_model.sql`).

The app now embeds resume chunks with `gemini-embedding-001` (768-dim) instead of
the legacy `embedding-001`. Vectors from two different models can't be compared by
cosine distance, so every pre-existing `resume_chunks` row must be re-embedded once.

**Order of operations on deploy:**

1. Apply `002_hybrid_search_and_embedding_model.sql` in the Supabase SQL editor.
2. Deploy the app.
3. Run this backfill:

   ```bash
   node scripts/reembed-resume-chunks.mjs --dry-run   # preview count
   node scripts/reembed-resume-chunks.mjs             # do it
   ```

Reads `.env.local` automatically. Needs `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`. Idempotent — only touches rows
whose `embedding_model` isn't already `gemini-embedding-001`.
