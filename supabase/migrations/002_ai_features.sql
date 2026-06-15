-- ============================================================================
-- DasaAI AI Features Schema
-- ============================================================================
-- Migration: 002_ai_features
-- Creates tables for AI-generated career roadmaps and chat history
-- References: user_profiles(id)
-- ============================================================================

-- ============================================================================
-- PHASE 1: CAREER ROADMAPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.career_roadmaps (
  id BIGSERIAL PRIMARY KEY,
  user_profile_id BIGINT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Career context
  career_goal TEXT,
  job_role VARCHAR(255),

  -- AI-generated content
  analysis JSONB DEFAULT '{}'::jsonb,
  strengths JSONB DEFAULT '{}'::jsonb,
  skill_gaps JSONB DEFAULT '{}'::jsonb,
  roadmap JSONB DEFAULT '{}'::jsonb,
  recommended_projects JSONB DEFAULT '{}'::jsonb,
  interview_prep JSONB DEFAULT '{}'::jsonb,

  -- Generation metadata
  model_name VARCHAR(100),
  prompt_hash VARCHAR(64),
  status VARCHAR(30) DEFAULT 'draft',
  generated_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 2: AI CHAT HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id BIGSERIAL PRIMARY KEY,
  user_profile_id BIGINT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  roadmap_id BIGINT REFERENCES public.career_roadmaps(id) ON DELETE SET NULL,

  -- Message content
  role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Model info
  model_name VARCHAR(100),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (role IN ('user', 'ai'))
);

-- ============================================================================
-- PHASE 3: INDEXES
-- ============================================================================

-- career_roadmaps lookups
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_profile_id
  ON public.career_roadmaps(user_profile_id);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_created_at
  ON public.career_roadmaps(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_status
  ON public.career_roadmaps(status) WHERE status = 'active';

-- ai_chat_history lookups
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_profile_id
  ON public.ai_chat_history(user_profile_id);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at
  ON public.ai_chat_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_roadmap_id
  ON public.ai_chat_history(roadmap_id) WHERE roadmap_id IS NOT NULL;

-- ============================================================================
-- PHASE 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 5: RLS POLICIES — career_roadmaps
-- ============================================================================

CREATE POLICY "roadmaps_select_own"
  ON public.career_roadmaps
  FOR SELECT
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "roadmaps_insert_own"
  ON public.career_roadmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "roadmaps_update_own"
  ON public.career_roadmaps
  FOR UPDATE
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "roadmaps_delete_own"
  ON public.career_roadmaps
  FOR DELETE
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

-- ============================================================================
-- PHASE 6: RLS POLICIES — ai_chat_history
-- ============================================================================

CREATE POLICY "chathistory_select_own"
  ON public.ai_chat_history
  FOR SELECT
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "chathistory_insert_own"
  ON public.ai_chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "chathistory_update_own"
  ON public.ai_chat_history
  FOR UPDATE
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "chathistory_delete_own"
  ON public.ai_chat_history
  FOR DELETE
  TO authenticated
  USING (
    user_profile_id = (
      SELECT id FROM public.user_profiles WHERE auth_id = auth.uid()
    )
  );

-- ============================================================================
-- PHASE 7: TRIGGER — updated_at for career_roadmaps
-- ============================================================================

DROP TRIGGER IF EXISTS update_career_roadmaps_updated_at ON public.career_roadmaps;
CREATE TRIGGER update_career_roadmaps_updated_at
  BEFORE UPDATE ON public.career_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PHASE 8: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_roadmaps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_history TO authenticated;

GRANT USAGE ON SEQUENCE public.career_roadmaps_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.ai_chat_history_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_roadmaps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_history TO service_role;

GRANT USAGE ON SEQUENCE public.career_roadmaps_id_seq TO service_role;
GRANT USAGE ON SEQUENCE public.ai_chat_history_id_seq TO service_role;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
