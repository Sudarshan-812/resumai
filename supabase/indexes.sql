-- Performance indexes for common query patterns
-- Run once against your Supabase project

-- Dashboard: resumes ordered by date per user
CREATE INDEX IF NOT EXISTS idx_resumes_user_created
  ON resumes(user_id, created_at DESC);

-- Resume chunks: lookup by resume + user
CREATE INDEX IF NOT EXISTS idx_resume_chunks_resume_user
  ON resume_chunks(resume_id, user_id);

-- Analyses: lookup by resume
CREATE INDEX IF NOT EXISTS idx_analyses_resume_id
  ON analyses(resume_id);

-- Profiles: already has PK on id, no extra index needed

-- Resume versions: list by user
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_created
  ON resume_versions(user_id, created_at DESC);

-- Partial index: only non-soft-deleted rows (after soft_deletes.sql applied)
CREATE INDEX IF NOT EXISTS idx_resumes_active
  ON resumes(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
