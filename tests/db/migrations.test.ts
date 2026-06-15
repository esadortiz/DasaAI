import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("database hardening migrations", () => {
  it("removes public user_profiles read access", () => {
    const sql = readFileSync("supabase/migrations/004_harden_user_profiles_rls.sql", "utf8");

    expect(sql).toContain('DROP POLICY IF EXISTS "profiles_select_public"');
    expect(sql).toContain("REVOKE SELECT ON public.user_profiles FROM anon");
    expect(sql).toContain('CREATE POLICY "profiles_select_own"');
    expect(sql).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });

  it("adds distributed rate limit RPC", () => {
    const sql = readFileSync("supabase/migrations/005_api_rate_limits.sql", "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.api_rate_limits");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.check_api_rate_limit");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.check_api_rate_limit");
  });
});
