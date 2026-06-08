import { describe, expect, it } from "vitest";

import { hashPassword } from "./old-hash";

describe("hashPassword", () => {
  it("returns the SHA-256 hex digest of the input", () => {
    expect(hashPassword("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("produces a 64-character hex string", () => {
    expect(hashPassword("any-input")).toMatch(/^[0-9a-f]{64}$/);
  });
});
