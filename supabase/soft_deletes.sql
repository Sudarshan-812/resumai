-- ═══════════════════════════════════════════════════════
-- STEP 1 — Run this block first, then run Step 2 below
-- ═══════════════════════════════════════════════════════

ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;


-- ═══════════════════════════════════════════════════════
-- STEP 2 — Run AFTER Step 1 completes successfully
-- ═══════════════════════════════════════════════════════

-- Drop old SELECT policy (name may vary — check Auth > Policies in Supabase dashboard)
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Enable read access for own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can select own resumes" ON resumes;

-- New SELECT policy: hide soft-deleted rows automatically
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Allow users to soft-delete (UPDATE deleted_at) their own resumes
DROP POLICY IF EXISTS "Users can soft delete own resumes" ON resumes;
CREATE POLICY "Users can soft delete own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Helper RPC: call this instead of DELETE to soft-delete
CREATE OR REPLACE FUNCTION soft_delete_resume(p_resume_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE resumes
  SET deleted_at = NOW()
  WHERE id = p_resume_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
