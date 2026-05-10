import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("should return true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user+tag@domain.co.uk")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("should return false for non-string input", () => {
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });

  it("should return false for emails longer than 254 characters", () => {
    const longLocal = "a".repeat(250);
    const longEmail = `${longLocal}@test.com`;
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should return false for invalid email formats", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("should trim whitespace and convert to lowercase", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    expect(normalizeEmail("TEST@DOMAIN.NET")).toBe("test@domain.net");
  });

  it("should handle already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("should handle empty and whitespace-only strings", () => {
    expect(normalizeEmail("")).toBe("");
    expect(normalizeEmail("   ")).toBe("");
  });

  it("should handle emails with only leading or trailing spaces", () => {
    expect(normalizeEmail("  user@example.com")).toBe("user@example.com");
    expect(normalizeEmail("user@example.com  ")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("should mask the local part of a valid email", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("alice@domain.org")).toBe("al***@domain.org");
  });

  it("should handle short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("should handle emails with one-character local part", () => {
    expect(maskEmail("x@example.com")).toBe("x@example.com");
  });

  it("should return input unchanged when no @ sign present", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
  });

  it("should handle malformed emails gracefully", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
    expect(maskEmail("user@")).toBe("user@");
  });

  it("should handle long local parts correctly", () => {
    expect(maskEmail("verylongusername@example.com")).toBe(
      "ve**************@example.com"
    );
  });
});
