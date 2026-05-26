-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Fixes the 400 error on profiles queries by ensuring:
--   1. The profiles table exists with the correct columns
--   2. RLS is enabled with a self-read policy
--   3. Existing users who have no profile row get one created
--   4. A trigger auto-creates a profile row on every new signup
-- ============================================================

-- 1. Ensure the profiles table exists with expected columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name  text,
  credits    integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policy: users can only read/update their own row
-- (DROP first so re-running this script is idempotent)
DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Backfill: create a profile row for every auth user who doesn't have one
INSERT INTO public.profiles (id, full_name, credits)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 5. Trigger function: auto-create profile on every new signup
-- Issue 20: Validate raw_user_meta_data before extracting fields.
-- raw_user_meta_data is typed jsonb by Supabase so it's always valid JSON or NULL.
-- NULLIF+TRIM ensures empty strings from OAuth providers are stored as NULL, not "".
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
BEGIN
  -- Safely extract full_name; treat empty strings as NULL
  v_full_name := NULLIF(
    TRIM(COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    )),
    ''
  );

  INSERT INTO public.profiles (id, full_name, credits)
  VALUES (NEW.id, v_full_name, 0)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup due to profile creation failure
  RAISE WARNING 'handle_new_user: profile creation failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 6. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
