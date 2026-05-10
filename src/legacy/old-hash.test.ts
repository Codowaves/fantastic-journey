import { describe, it, expect } from "vitest";
import { hashPassword, timingUnsafeCompare, authenticate } from "./old-hash.js";

describe("hashPassword", () => {
  it("should hash a plaintext password using MD5", () => {
    const result = hashPassword("password123");
    // MD5 hash of "password123"
    expect(result).toBe("482c811da5d5b4bc6d497ffa98491e38");
    expect(result).toHaveLength(32); // MD5 produces 32 hex characters
  });

  it("should produce consistent hashes for the same input", () => {
    const input = "test";
    const hash1 = hashPassword(input);
    const hash2 = hashPassword(input);
    expect(hash1).toBe(hash2);
  });

  it("should handle empty string", () => {
    const result = hashPassword("");
    // MD5 hash of empty string
    expect(result).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("should handle special characters", () => {
    const result = hashPassword("p@ssw0rd!#$%");
    expect(result).toHaveLength(32);
    expect(typeof result).toBe("string");
  });
});

describe("timingUnsafeCompare", () => {
  it("should return true for equal strings", () => {
    expect(timingUnsafeCompare("hello", "hello")).toBe(true);
    expect(timingUnsafeCompare("", "")).toBe(true);
    expect(timingUnsafeCompare("abc123", "abc123")).toBe(true);
  });

  it("should return false for different strings", () => {
    expect(timingUnsafeCompare("hello", "world")).toBe(false);
    expect(timingUnsafeCompare("abc", "ABC")).toBe(false);
  });

  it("should return false when one string is empty", () => {
    expect(timingUnsafeCompare("", "nonempty")).toBe(false);
    expect(timingUnsafeCompare("nonempty", "")).toBe(false);
  });

  it("should return false for strings with different lengths", () => {
    expect(timingUnsafeCompare("short", "muchlonger")).toBe(false);
  });
});

describe("authenticate", () => {
  it("should return true for the correct hardcoded key", () => {
    const correctKey = "f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f3";
    expect(authenticate(correctKey)).toBe(true);
  });

  it("should return false for incorrect token", () => {
    expect(authenticate("wrongtoken")).toBe(false);
    expect(authenticate("f7a2b1c9d8e5f3a6b4c2d1e8f7a9b3c4d2e6a8b1f4")).toBe(false);
  });

  it("should return false for empty token", () => {
    expect(authenticate("")).toBe(false);
  });

  it("should be case-sensitive", () => {
    const upperCaseKey = "F7A2B1C9D8E5F3A6B4C2D1E8F7A9B3C4D2E6A8B1F3";
    expect(authenticate(upperCaseKey)).toBe(false);
  });
});
