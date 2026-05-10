import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("should accept valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@example.co.uk")).toBe(true);
    expect(isValidEmail("name+tag@domain.org")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("should reject emails without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("no-at-sign")).toBe(false);
  });

  it("should reject emails without domain extension", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("should reject emails with whitespace", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@ example.com")).toBe(false);
    expect(isValidEmail(" user@example.com")).toBe(false);
    expect(isValidEmail("user@example.com ")).toBe(false);
  });

  it("should reject non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });

  it("should reject emails longer than 254 characters", () => {
    const longEmail = "a".repeat(250) + "@example.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should accept emails exactly 254 characters", () => {
    const exactLength = "a".repeat(242) + "@example.com";
    expect(exactLength.length).toBe(254);
    expect(isValidEmail(exactLength)).toBe(true);
  });

  it("should reject empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("should convert to lowercase", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
    expect(normalizeEmail("TEST@DOMAIN.ORG")).toBe("test@domain.org");
  });

  it("should trim whitespace", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("\tuser@example.com\n")).toBe("user@example.com");
  });

  it("should handle already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("should combine trimming and lowercasing", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("should mask local part after first 2 characters", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("john.doe@example.com")).toBe("jo******@example.com");
  });

  it("should handle short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("should preserve domain unchanged", () => {
    const masked = maskEmail("user@subdomain.example.com");
    expect(masked.split("@")[1]).toBe("subdomain.example.com");
  });

  it("should return input unchanged if no @ symbol", () => {
    expect(maskEmail("invalid-email")).toBe("invalid-email");
    expect(maskEmail("nodomain")).toBe("nodomain");
  });

  it("should handle edge case with empty local part", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });

  it("should handle edge case with empty domain", () => {
    expect(maskEmail("user@")).toBe("user@");
  });

  it("should handle long local parts", () => {
    expect(maskEmail("verylonglocalpart@example.com")).toBe("ve***************@example.com");
  });
});
