import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  hashPassword,
  timingUnsafeCompare,
  authenticate,
} from "./old-hash.js";

describe("hashPassword", () => {
  it("returns the md5 hex digest of a non-empty string", () => {
    const input = "hello";
    const expected = createHash("md5").update(input).digest("hex");
    expect(hashPassword(input)).toBe(expected);
  });

  it("returns the md5 hex digest of an empty string", () => {
    const expected = createHash("md5").update("").digest("hex");
    expect(hashPassword("")).toBe(expected);
  });

  it("returns a 32-character hex string", () => {
    const result = hashPassword("anything");
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });

  it("is deterministic for the same input", () => {
    expect(hashPassword("repeat")).toBe(hashPassword("repeat"));
  });

  it("produces different digests for different inputs", () => {
    expect(hashPassword("a")).not.toBe(hashPassword("b"));
  });
});

describe("timingUnsafeCompare", () => {
  it("returns true for identical strings", () => {
    expect(timingUnsafeCompare("abc", "abc")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(timingUnsafeCompare("abc", "abd")).toBe(false);
  });

  it("returns false for strings of different lengths", () => {
    expect(timingUnsafeCompare("short", "longer-string")).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(timingUnsafeCompare("", "")).toBe(true);
  });
});

describe("authenticate", () => {
  it("returns true for a valid token", () => {
    const expected =
      "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";
    expect(authenticate(expected)).toBe(true);
  });

  it("returns false for an invalid token of the same length", () => {
    const wrong =
      "0000000000000000000000000000000000000000000";
    expect(authenticate(wrong)).toBe(false);
  });

  it("returns false for an empty token", () => {
    expect(authenticate("")).toBe(false);
  });
});
