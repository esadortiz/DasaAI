-- DasaAI auth/AI hardening fixes
-- Adds efficient chat history lookup and corrects JSONB defaults used as arrays.

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_profile_created_at
  ON public.ai_chat_history(user_profile_id, created_at ASC);

ALTER TABLE public.career_roadmaps
  ALTER COLUMN strengths SET DEFAULT '[]'::jsonb,
  ALTER COLUMN skill_gaps SET DEFAULT '[]'::jsonb,
  ALTER COLUMN recommended_projects SET DEFAULT '[]'::jsonb,
  ALTER COLUMN interview_prep SET DEFAULT '[]'::jsonb;

UPDATE public.career_roadmaps
SET
  strengths = CASE WHEN strengths = '{}'::jsonb THEN '[]'::jsonb ELSE strengths END,
  skill_gaps = CASE WHEN skill_gaps = '{}'::jsonb THEN '[]'::jsonb ELSE skill_gaps END,
  recommended_projects = CASE WHEN recommended_projects = '{}'::jsonb THEN '[]'::jsonb ELSE recommended_projects END,
  interview_prep = CASE WHEN interview_prep = '{}'::jsonb THEN '[]'::jsonb ELSE interview_prep END
WHERE strengths = '{}'::jsonb
   OR skill_gaps = '{}'::jsonb
   OR recommended_projects = '{}'::jsonb
   OR interview_prep = '{}'::jsonb;
