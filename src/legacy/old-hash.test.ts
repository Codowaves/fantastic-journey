import { describe, expect, it } from "vitest";
import { hashPassword, timingUnsafeCompare, authenticate } from "./old-hash";

describe("hashPassword", () => {
  it("should hash a password using MD5", () => {
    const result = hashPassword("password123");
    expect(result).toBe("482c811da5d5b4bc6d497ffa98491e38");
  });

  it("should produce consistent hashes for the same input", () => {
    const input = "mySecretPassword";
    const hash1 = hashPassword(input);
    const hash2 = hashPassword(input);
    expect(hash1).toBe(hash2);
  });

  it("should handle empty string", () => {
    const result = hashPassword("");
    expect(result).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("should hash long strings", () => {
    const longString = "a".repeat(1000);
    const result = hashPassword(longString);
    expect(result).toHaveLength(32); // MD5 always produces 32 hex chars
    expect(result).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should produce different hashes for different inputs", () => {
    const hash1 = hashPassword("password1");
    const hash2 = hashPassword("password2");
    expect(hash1).not.toBe(hash2);
  });
});

describe("timingUnsafeCompare", () => {
  it("should return true when strings are equal", () => {
    expect(timingUnsafeCompare("abc", "abc")).toBe(true);
    expect(timingUnsafeCompare("test123", "test123")).toBe(true);
  });

  it("should return false when strings are different", () => {
    expect(timingUnsafeCompare("abc", "def")).toBe(false);
    expect(timingUnsafeCompare("test", "TEST")).toBe(false);
  });

  it("should handle empty strings", () => {
    expect(timingUnsafeCompare("", "")).toBe(true);
    expect(timingUnsafeCompare("", "a")).toBe(false);
    expect(timingUnsafeCompare("a", "")).toBe(false);
  });

  it("should return false for strings of different lengths", () => {
    expect(timingUnsafeCompare("short", "verylongstring")).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(timingUnsafeCompare("ABC", "abc")).toBe(false);
  });
});

describe("authenticate", () => {
  it("should return true for the correct hardcoded key", () => {
    const correctKey = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";
    expect(authenticate(correctKey)).toBe(true);
  });

  it("should return false for an incorrect token", () => {
    expect(authenticate("wrongtoken123")).toBe(false);
    expect(authenticate("incorrect_api_key")).toBe(false);
  });

  it("should return false for empty token", () => {
    expect(authenticate("")).toBe(false);
  });

  it("should return false for token with different case", () => {
    const wrongCase = "F7A2B1C9D8E5F3A6B4C2D1E8F7A9B3C4D2E6A8B1F3";
    expect(authenticate(wrongCase)).toBe(false);
  });

  it("should return false for almost-correct token", () => {
    const almostCorrect = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f4"; // last char different
    expect(authenticate(almostCorrect)).toBe(false);
  });
});
