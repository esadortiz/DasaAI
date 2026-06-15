import { describe, expect, it, vi } from "vitest";
import { checkDistributedRateLimit, checkRateLimit } from "../../src/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const first = checkRateLimit({ key: "test-within", limit: 2, windowMs: 1000, now: 100 });
    const second = checkRateLimit({ key: "test-within", limit: 2, windowMs: 1000, now: 200 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("rejects requests over the limit", () => {
    checkRateLimit({ key: "test-over", limit: 1, windowMs: 1000, now: 100 });
    const second = checkRateLimit({ key: "test-over", limit: 1, windowMs: 1000, now: 200 });

    expect(second.allowed).toBe(false);
  });

  it("uses Supabase RPC results when available", async () => {
    const result = await checkDistributedRateLimit({
      rpc: async () => ({ data: [{ allowed: false, remaining: 0, retry_after: 30, reset_at: new Date().toISOString() }], error: null }),
    }, { key: "rpc", limit: 1, windowSeconds: 60 });

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(30);
    expect(result.source).toBe("supabase");
  });

  it("falls back to memory if RPC fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await checkDistributedRateLimit({
      rpc: async () => ({ data: null, error: { message: "missing function" } }),
    }, { key: "fallback", limit: 1, windowSeconds: 60 });

    expect(result.allowed).toBe(true);
    expect(result.source).toBe("memory");
    errorSpy.mockRestore();
  });
});
