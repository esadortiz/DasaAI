import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../src/lib/api/api-fetch";

const originalWindow = globalThis.window;

function mockWindow(pathname = "/coach", search = "?thread=1") {
  const assign = vi.fn();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname, search, assign } },
  });
  return assign;
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  });

  it("returns parsed JSON for ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true })));

    const result = await apiFetch<{ ok: boolean }>("/api/test");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.ok).toBe(true);
  });

  it("redirects to login on 401 with safe next path", async () => {
    const assign = mockWindow();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Unauthorized" }, { status: 401 })));

    const result = await apiFetch("/api/test");

    expect(result.ok).toBe(false);
    expect(assign).toHaveBeenCalledWith("/login?next=%2Fcoach%3Fthread%3D1");
  });

  it("returns safe error for non-JSON failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not json", { status: 500 })));

    const result = await apiFetch("/api/test");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Request failed. Please try again.");
  });

  it("preserves API error messages for 429", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Too many requests" }, { status: 429 })));

    const result = await apiFetch("/api/test");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Too many requests");
  });
});
