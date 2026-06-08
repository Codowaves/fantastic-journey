import { describe, expect, it } from "vitest";

import { hashPassword } from "./old-hash";

describe("hashPassword", () => {
  it("hashes a known input with SHA-256", () => {
    expect(hashPassword("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("returns a 64-character hex string", () => {
    expect(hashPassword("anything")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different digests for different inputs", () => {
    expect(hashPassword("a")).not.toBe(hashPassword("b"));
  });
});
