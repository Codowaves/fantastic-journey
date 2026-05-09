import { describe, it, expect } from "vitest";
import { hashPassword, timingUnsafeCompare, authenticate } from "./old-hash";

describe("hashPassword", () => {
  it("should hash password to 32-character hex string", () => {
    const hash = hashPassword("password123");
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should produce consistent hash for same input", () => {
    const password = "testpassword";
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", () => {
    const hash1 = hashPassword("password1");
    const hash2 = hashPassword("password2");
    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty string", () => {
    const hash = hashPassword("");
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should handle special characters", () => {
    const hash = hashPassword("p@ssw0rd!#$%");
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should handle unicode characters", () => {
    const hash = hashPassword("пароль123");
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should handle very long passwords", () => {
    const longPassword = "a".repeat(1000);
    const hash = hashPassword(longPassword);
    expect(hash).toHaveLength(32);
  });

  it("should produce known MD5 hash for test input", () => {
    const hash = hashPassword("test");
    expect(hash).toBe("098f6bcd4621d373cade4e832627b4f6");
  });
});

describe("timingUnsafeCompare", () => {
  it("should return true for identical strings", () => {
    expect(timingUnsafeCompare("abc", "abc")).toBe(true);
    expect(timingUnsafeCompare("test123", "test123")).toBe(true);
    expect(timingUnsafeCompare("", "")).toBe(true);
  });

  it("should return false for different strings", () => {
    expect(timingUnsafeCompare("abc", "def")).toBe(false);
    expect(timingUnsafeCompare("test", "Test")).toBe(false);
  });

  it("should return false for strings of different lengths", () => {
    expect(timingUnsafeCompare("short", "longer")).toBe(false);
    expect(timingUnsafeCompare("a", "ab")).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(timingUnsafeCompare("Password", "password")).toBe(false);
    expect(timingUnsafeCompare("ABC", "abc")).toBe(false);
  });

  it("should handle empty strings", () => {
    expect(timingUnsafeCompare("", "")).toBe(true);
    expect(timingUnsafeCompare("", "a")).toBe(false);
    expect(timingUnsafeCompare("a", "")).toBe(false);
  });

  it("should handle special characters", () => {
    expect(timingUnsafeCompare("!@#$", "!@#$")).toBe(true);
    expect(timingUnsafeCompare("!@#$", "!@#%")).toBe(false);
  });

  it("should handle unicode characters", () => {
    expect(timingUnsafeCompare("тест", "тест")).toBe(true);
    expect(timingUnsafeCompare("тест", "test")).toBe(false);
  });

  it("should return false for similar but not identical strings", () => {
    expect(timingUnsafeCompare("abcdef", "abcdeg")).toBe(false);
    expect(timingUnsafeCompare("test1", "test2")).toBe(false);
  });
});

describe("authenticate", () => {
  it("should return true for correct hardcoded key", () => {
    const correctKey = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";
    expect(authenticate(correctKey)).toBe(true);
  });

  it("should return false for incorrect key", () => {
    expect(authenticate("wrongkey")).toBe(false);
    expect(authenticate("")).toBe(false);
    expect(authenticate("f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f4")).toBe(false);
  });

  it("should return false for key with wrong case", () => {
    const wrongCase = "F7A2B1C9D8E5F3A6B4C2D1E8F7A9B3C4D2E6A8B1F3";
    expect(authenticate(wrongCase)).toBe(false);
  });

  it("should return false for key with extra characters", () => {
    const tooLong = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3x";
    expect(authenticate(tooLong)).toBe(false);
  });

  it("should return false for key missing characters", () => {
    const tooShort = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f";
    expect(authenticate(tooShort)).toBe(false);
  });

  it("should return false for similar but incorrect keys", () => {
    expect(authenticate("f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f2")).toBe(false);
    expect(authenticate("g7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3")).toBe(false);
  });

  it("should handle empty string token", () => {
    expect(authenticate("")).toBe(false);
  });

  it("should handle whitespace in token", () => {
    const keyWithSpace = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3 ";
    expect(authenticate(keyWithSpace)).toBe(false);
  });
});
