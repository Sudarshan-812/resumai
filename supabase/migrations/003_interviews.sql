-- ============================================================
-- 003 - Durable interview history (voice + text)
--
-- Both the spoken mock interview and the text mock interview now persist one
-- row per completed session. Previously the voice summary lived only in
-- localStorage and the text run left nothing behind.
-- Idempotent: safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS interviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  resume_id      uuid REFERENCES resumes ON DELETE SET NULL,
  mode           text NOT NULL CHECK (mode IN ('voice', 'text')),
  role           text,
  job_description text,
  transcript     text,                       -- voice: raw transcript; text: formatted Q/A
  score          integer,                    -- 0-100 aggregate
  summary        text,                       -- voice: 2-sentence verdict
  strengths      jsonb NOT NULL DEFAULT '[]'::jsonb,
  improvements   jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlight      text,                       -- the one question most worth re-practising
  per_question   jsonb,                      -- text: [{question, category, answer, score, strengths, improvements, model_answer_hint}]
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interviews_owner" ON interviews;
CREATE POLICY "interviews_owner" ON interviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS interviews_user_created_idx
  ON interviews (user_id, created_at DESC);
