import { describe, expect, it } from "vitest";
import { safeInternalPath } from "../../src/lib/security/redirects";

describe("safeInternalPath", () => {
  it("allows internal paths with query strings", () => {
    expect(safeInternalPath("/coach?tab=history", "/profile")).toBe("/coach?tab=history");
  });

  it("rejects absolute external URLs", () => {
    expect(safeInternalPath("https://evil.test/coach", "/profile")).toBe("/profile");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeInternalPath("//evil.test/coach", "/profile")).toBe("/profile");
  });
});
