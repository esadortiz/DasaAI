import { afterEach, describe, expect, it } from "vitest";
import { isAllowedRequestOrigin } from "../../src/lib/security/csrf";

function requestWithHeaders(headers: HeadersInit) {
  return new Request("https://app.example.com/api/ai/chat", { method: "POST", headers });
}

describe("isAllowedRequestOrigin", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("allows same-origin requests", () => {
    expect(isAllowedRequestOrigin(requestWithHeaders({ origin: "https://app.example.com" }))).toBe(true);
  });

  it("allows configured site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://dasaai.example.com";
    expect(isAllowedRequestOrigin(requestWithHeaders({ origin: "https://dasaai.example.com" }))).toBe(true);
  });

  it("rejects cross-site requests", () => {
    expect(isAllowedRequestOrigin(requestWithHeaders({ origin: "https://evil.example.com" }))).toBe(false);
  });

  it("rejects requests without origin or referer", () => {
    expect(isAllowedRequestOrigin(requestWithHeaders({}))).toBe(false);
  });
});
