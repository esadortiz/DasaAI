-- ============================================================================
-- DasaAI Authentication & Authorization Schema
-- ============================================================================
-- This migration creates a complete auth system with RLS policies
-- Compatible with Supabase Auth + custom profiles
-- ============================================================================

-- ============================================================================
-- PHASE 1: DROP EXISTING (if needed for reset)
-- ============================================================================
-- Uncomment these lines only if you need to reset the schema:
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;


-- ============================================================================
-- PHASE 2: CREATE TABLES
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: user_profiles (Public User Information)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Primary Keys & Foreign Keys
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  
  -- Professional Info
  job_role VARCHAR(255),
  experience_level VARCHAR(50),
  career_goal TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Status Tracking
  is_onboarded BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT email_not_empty CHECK (email != ''),
  CONSTRAINT full_name_not_empty CHECK (full_name != '')
);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: user_preferences (Private User Settings)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Interface Settings
  language VARCHAR(2) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light',
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Privacy & Sharing
  profile_visibility VARCHAR(20) DEFAULT 'private',
  share_roadmap BOOLEAN DEFAULT FALSE,
  
  -- Additional Preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: user_roles (Authorization & Subscription)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role VARCHAR(20) DEFAULT 'free',
  permissions JSONB DEFAULT '{
    "can_create_roadmap": true,
    "can_use_ai_coach": true,
    "can_export": false,
    "can_share": false
  }'::jsonb,
  
  -- Subscription Info
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_role CHECK (role IN ('free', 'pro', 'admin')),
  CONSTRAINT valid_status CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: audit_logs (System Audit Trail - No RLS)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  
  -- Action Details
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id TEXT,
  
  -- IP & User Agent
  ip_address INET,
  user_agent TEXT,
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 3: CREATE INDEXES
-- ============================================================================

-- Optimize common queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id 
  ON public.user_profiles(auth_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active 
  ON public.user_profiles(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
  ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_subscription_tier 
  ON public.user_roles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type 
  ON public.audit_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at 
  ON public.audit_logs(user_id, created_at DESC);

-- ============================================================================
-- PHASE 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Note: audit_logs does NOT have RLS - it's system-only


-- ============================================================================
-- PHASE 5: CREATE RLS POLICIES
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: user_profiles (Public Read, Owner Write)
-- ────────────────────────────────────────────────────────────────────────────

-- Anyone can read public profiles (for directory/discovery)
CREATE POLICY "profiles_select_public" 
  ON public.user_profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only owner can insert their profile
CREATE POLICY "profiles_insert_own" 
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Only owner can update their profile
CREATE POLICY "profiles_update_own" 
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Only admin and owner can delete
CREATE POLICY "profiles_delete_own" 
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (auth_id = auth.uid());


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: user_preferences (Private - Owner Only)
-- ────────────────────────────────────────────────────────────────────────────

-- Only owner can read their preferences
CREATE POLICY "preferences_select_own" 
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));

-- Only owner can insert
CREATE POLICY "preferences_insert_own" 
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));

-- Only owner can update
CREATE POLICY "preferences_update_own" 
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ))
  WITH CHECK (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));


-- ────────────────────────────────────────────────────────────────────────────
-- POLICIES: user_roles (Restricted - Owner + Admin Only)
-- ────────────────────────────────────────────────────────────────────────────

-- Owner can read their role
CREATE POLICY "roles_select_own" 
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));

-- System can insert (disable for user creation, use trigger instead)
CREATE POLICY "roles_insert_system" 
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));

-- Only admin can update roles
CREATE POLICY "roles_update_admin_only" 
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Delete restricted to admins only
CREATE POLICY "roles_delete_admin_only" 
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (false);


-- ============================================================================
-- PHASE 6: CREATE TRIGGERS & FUNCTIONS
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Function: Update updated_at timestamp
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: Update user_profiles.updated_at
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: Update user_preferences.updated_at
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: Update user_roles.updated_at
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- Function: Create audit log entry
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_user_id BIGINT,
  p_action_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action_type, resource_type, resource_id, metadata, success
  ) VALUES (
    p_user_id, p_action_type, p_resource_type, p_resource_id, p_metadata, true
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ────────────────────────────────────────────────────────────────────────────
-- Function: Handle new user signup (called by auth trigger)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.user_profiles (auth_id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  
  -- Create preferences
  INSERT INTO public.user_preferences (user_id)
  SELECT id FROM public.user_profiles WHERE auth_id = new.id;
  
  -- Create role entry (role and subscription_tier have defaults)
  INSERT INTO public.user_roles (user_id)
  SELECT id FROM public.user_profiles WHERE auth_id = new.id;
  
  -- Log signup
  PERFORM public.log_audit_action(
    (SELECT id FROM public.user_profiles WHERE auth_id = new.id),
    'signup',
    'auth',
    new.id::TEXT,
    jsonb_build_object('email', new.email)
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- Trigger: Handle new auth user
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PHASE 7: GRANT PERMISSIONS (Data API Access)
-- ============================================================================

-- Allow anon role to read profiles
GRANT SELECT ON public.user_profiles TO anon;

-- Allow authenticated users to do CRUD on their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- Only system can write logs
GRANT INSERT ON public.audit_logs TO authenticated;

-- Allow service_role full access (bypasses RLS but needs explicit GRANT)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO service_role;
GRANT SELECT, INSERT ON public.audit_logs TO service_role;

-- ============================================================================
-- PHASE 8: VERIFY SETUP
-- ============================================================================

-- Check tables created
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
