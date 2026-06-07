-- ============================================================
-- Run in Supabase SQL Editor
-- Adds plan + interview tracking to profiles
-- ============================================================

-- 1. Plan column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free'
  CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro', 'premium'));

-- 2. Interview tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interviews_this_month integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interviews_reset_date date NOT NULL DEFAULT CURRENT_DATE;

-- 3. Check limit (read-only — does NOT increment)
CREATE OR REPLACE FUNCTION public.check_interview_limit(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_plan        text;
  v_count       integer;
  v_reset_date  date;
BEGIN
  SELECT plan, interviews_this_month, interviews_reset_date
  INTO v_plan, v_count, v_reset_date
  FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN RETURN 'ok'; END IF;
  IF v_plan IN ('pro', 'premium') THEN RETURN 'ok'; END IF;

  -- Reset counter if a new month has started
  IF date_trunc('month', v_reset_date) < date_trunc('month', CURRENT_DATE) THEN
    v_count := 0;
  END IF;

  IF v_count >= 3 THEN RETURN 'limit_reached'; END IF;
  RETURN 'ok';
END;
$$;

-- 4. Increment counter (only for free plan; pro/premium skip)
CREATE OR REPLACE FUNCTION public.increment_interview_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    interviews_this_month = CASE
      WHEN date_trunc('month', interviews_reset_date) < date_trunc('month', CURRENT_DATE) THEN 1
      ELSE interviews_this_month + 1
    END,
    interviews_reset_date = CASE
      WHEN date_trunc('month', interviews_reset_date) < date_trunc('month', CURRENT_DATE) THEN CURRENT_DATE
      ELSE interviews_reset_date
    END
  WHERE id = p_user_id AND plan = 'free';
END;
$$;

-- 5. Upgrade plan (called server-side after payment verification)
CREATE OR REPLACE FUNCTION public.set_user_plan(p_user_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET plan = p_plan WHERE id = p_user_id;
END;
$$;
