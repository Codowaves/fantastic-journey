import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email";

describe("isValidEmail", () => {
  it("should return true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@example.co.uk")).toBe(true);
    expect(isValidEmail("user+tag@domain.org")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("should return false for invalid email addresses", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@ex ample.com")).toBe(false);
    expect(isValidEmail("user@@example.com")).toBe(false);
  });

  it("should return false for empty or whitespace strings", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("   ")).toBe(false);
  });

  it("should return false for emails longer than 254 characters", () => {
    const longEmail = "a".repeat(250) + "@example.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should return false for non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("should trim whitespace from email addresses", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("\tuser@example.com\n")).toBe("user@example.com");
  });

  it("should convert email to lowercase", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    expect(normalizeEmail("User@Example.Com")).toBe("user@example.com");
  });

  it("should trim and lowercase simultaneously", () => {
    expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
  });

  it("should handle already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("should handle empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });
});

describe("maskEmail", () => {
  it("should mask local part of email keeping first 2 characters", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("alice@domain.org")).toBe("al***@domain.org");
  });

  it("should handle short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("should handle long local parts", () => {
    expect(maskEmail("verylongemail@example.com")).toBe("ve***********@example.com");
  });

  it("should return input unchanged if no @ sign", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
  });

  it("should handle edge cases with missing parts", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
    expect(maskEmail("user@")).toBe("user@");
  });

  it("should handle multiple @ signs by treating second @ as part of domain", () => {
    // split("@") on "user@@example.com" gives ["user", "", "example.com"]
    // domain is empty string, so returns input unchanged
    expect(maskEmail("user@@example.com")).toBe("user@@example.com");
  });
});
