// Replace this file with generated Supabase types when connected to the real project:
// npx supabase gen types typescript --project-id your-project-ref --schema public > src/lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: number;
          auth_id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          job_role: string | null;
          experience_level: string | null;
          career_goal: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          is_onboarded: boolean | null;
          is_active: boolean | null;
          last_login_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]> & {
          auth_id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
        Relationships: [];
      };
      career_roadmaps: {
        Row: {
          id: number;
          user_profile_id: number;
          career_goal: string | null;
          job_role: string | null;
          analysis: Json | null;
          strengths: Json | null;
          skill_gaps: Json | null;
          roadmap: Json | null;
          recommended_projects: Json | null;
          interview_prep: Json | null;
          model_name: string | null;
          prompt_hash: string | null;
          status: string | null;
          generated_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["career_roadmaps"]["Row"]> & { user_profile_id: number };
        Update: Partial<Database["public"]["Tables"]["career_roadmaps"]["Row"]>;
        Relationships: [];
      };
      ai_chat_history: {
        Row: {
          id: number;
          user_profile_id: number;
          roadmap_id: number | null;
          role: "user" | "ai";
          message: string;
          metadata: Json | null;
          model_name: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_chat_history"]["Row"]> & {
          user_profile_id: number;
          role: "user" | "ai";
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_chat_history"]["Row"]>;
        Relationships: [];
      };
      api_rate_limits: {
        Row: { key: string; window_start: string; count: number; expires_at: string };
        Insert: { key: string; window_start: string; count?: number; expires_at: string };
        Update: Partial<Database["public"]["Tables"]["api_rate_limits"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_api_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: { allowed: boolean; remaining: number; retry_after: number; reset_at: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
