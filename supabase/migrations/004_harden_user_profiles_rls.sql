-- Harden user_profiles RLS: profiles contain personal data and must not be public.

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

REVOKE SELECT ON public.user_profiles FROM anon;

DROP POLICY IF EXISTS "profiles_select_public" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.user_profiles;

CREATE POLICY "profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (auth_id = auth.uid());

-- No anon SELECT policy is intentionally created.
-- If public profiles are needed later, expose a separate view with non-sensitive columns only.
