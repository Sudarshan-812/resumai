-- ============================================================
-- 002 - Hybrid retrieval for resume_chunks + embedding-model tracking
--
-- Adds:
--   1. resume_chunks.embedding_model      - which model produced the vector
--   2. GIN FTS index on content           - BM25 half of hybrid search
--   3. HNSW index on embedding            - fast ANN for the dense half
--   4. search_resume_chunks_hybrid(...)   - dense + BM25 fused via RRF (k=60)
--
-- The old search_resume_chunks() is left in place (nothing is dropped).
-- Idempotent: safe to re-run.
--
-- AFTER applying this, run scripts/reembed-resume-chunks.mjs once so every
-- existing row is re-embedded with the current model. Rows embedded with two
-- different models cannot be compared by cosine distance.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Track the embedding model per chunk (prevents silent search degradation
--    when the model changes). Existing rows were made with 'embedding-001'.
ALTER TABLE resume_chunks
  ADD COLUMN IF NOT EXISTS embedding_model text NOT NULL DEFAULT 'embedding-001';

-- 2. BM25 / full-text half of hybrid search.
CREATE INDEX IF NOT EXISTS resume_chunks_content_fts_idx
  ON resume_chunks USING gin (to_tsvector('english', content));

-- 3. Dense / ANN half. Prefer HNSW (no training, stable as the table grows);
--    fall back to IVFFlat on older pgvector builds that lack HNSW.
DO $$
BEGIN
  BEGIN
    CREATE INDEX IF NOT EXISTS resume_chunks_embedding_hnsw_idx
      ON resume_chunks USING hnsw (embedding vector_cosine_ops);
  EXCEPTION WHEN undefined_object OR feature_not_supported OR syntax_error THEN
    CREATE INDEX IF NOT EXISTS resume_chunks_embedding_ivfflat_idx
      ON resume_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END;
END $$;

-- 4. Hybrid retrieval: run dense + BM25 independently, fuse with Reciprocal
--    Rank Fusion (score = sum of 1/(k + rank) across the lists a chunk appears
--    in). k=60 is the standard RRF constant. Scoped to one user, optionally to
--    one resume. If the FTS query matches nothing (e.g. a very long JD as the
--    query) the result gracefully degrades to pure vector order.
CREATE OR REPLACE FUNCTION search_resume_chunks_hybrid(
  query_embedding vector(768),
  query_text      text,
  match_user_id   uuid,
  match_resume_id uuid   DEFAULT NULL,
  match_count     int    DEFAULT 10,
  match_threshold float  DEFAULT 0.0,
  rrf_k           int    DEFAULT 60
)
RETURNS TABLE (
  id         uuid,
  content    text,
  chunk_type text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  WITH visible AS (
    SELECT rc.id, rc.content, rc.chunk_type, rc.embedding
    FROM resume_chunks rc
    WHERE rc.user_id = match_user_id
      AND (match_resume_id IS NULL OR rc.resume_id = match_resume_id)
      AND rc.embedding IS NOT NULL
  ),
  vector_search AS (
    SELECT v.id, v.content, v.chunk_type,
           ROW_NUMBER() OVER (ORDER BY v.embedding <=> query_embedding) AS rank
    FROM visible v
    WHERE 1 - (v.embedding <=> query_embedding) > match_threshold
    ORDER BY v.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  bm25_search AS (
    SELECT v.id, v.content, v.chunk_type,
           ROW_NUMBER() OVER (
             ORDER BY ts_rank_cd(to_tsvector('english', v.content),
                                 websearch_to_tsquery('english', query_text)) DESC
           ) AS rank
    FROM visible v
    WHERE length(coalesce(query_text, '')) > 0
      AND to_tsvector('english', v.content) @@ websearch_to_tsquery('english', query_text)
    ORDER BY rank
    LIMIT match_count * 2
  ),
  fused AS (
    SELECT
      COALESCE(vs.id, bs.id)                AS id,
      COALESCE(vs.content, bs.content)      AS content,
      COALESCE(vs.chunk_type, bs.chunk_type) AS chunk_type,
      COALESCE(1.0 / (rrf_k + vs.rank), 0.0)
        + COALESCE(1.0 / (rrf_k + bs.rank), 0.0) AS score
    FROM vector_search vs
    FULL OUTER JOIN bm25_search bs ON vs.id = bs.id
  )
  SELECT id, content, chunk_type, score AS similarity
  FROM fused
  ORDER BY score DESC
  LIMIT match_count;
$$;
