-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Resume chunks: semantic sections with embeddings
CREATE TABLE IF NOT EXISTS resume_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  resume_id uuid REFERENCES resumes NOT NULL,
  content text NOT NULL,
  chunk_type text NOT NULL, -- 'experience', 'skills', 'education', 'project', 'summary'
  embedding vector(768),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resume_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_chunks_user_policy" ON resume_chunks;
CREATE POLICY "resume_chunks_user_policy"
  ON resume_chunks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resume versions: curated tailored resumes built from chunks
CREATE TABLE IF NOT EXISTS resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  parent_resume_id uuid REFERENCES resumes NOT NULL,
  version_name text NOT NULL,
  content text NOT NULL,
  job_description text,
  ats_score integer,
  selected_chunk_ids uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_versions_user_policy" ON resume_versions;
CREATE POLICY "resume_versions_user_policy"
  ON resume_versions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure embedding column is vector(768) (safe to re-run on existing tables)
ALTER TABLE resume_chunks
  ALTER COLUMN embedding TYPE vector(768)
  USING embedding::vector(768);

-- Semantic search RPC: ranks chunks by cosine similarity to a query embedding
CREATE OR REPLACE FUNCTION search_resume_chunks(
  query_embedding vector(768),
  query_text text,
  match_user_id uuid,
  match_resume_id uuid DEFAULT NULL,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  chunk_type text,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.content,
    rc.chunk_type,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM resume_chunks rc
  WHERE rc.user_id = match_user_id
    AND (match_resume_id IS NULL OR rc.resume_id = match_resume_id)
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
