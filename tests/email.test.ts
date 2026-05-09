import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email";

describe("isValidEmail", () => {
  it("should return true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
    expect(isValidEmail("name+tag@example.org")).toBe(true);
  });

  it("should return false for invalid email addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@exam ple.com")).toBe(false);
  });

  it("should return false for non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });

  it("should return false for emails exceeding 254 characters", () => {
    const longEmail = "a".repeat(246) + "@test.com"; // 255 chars total
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should return true for emails at exactly 254 characters", () => {
    const exactEmail = "a".repeat(245) + "@test.com"; // exactly 254 chars
    expect(isValidEmail(exactEmail)).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("should trim whitespace from email addresses", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("user@example.com ")).toBe("user@example.com");
    expect(normalizeEmail(" user@example.com")).toBe("user@example.com");
  });

  it("should convert email addresses to lowercase", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    expect(normalizeEmail("User@Example.Com")).toBe("user@example.com");
    expect(normalizeEmail("TeSt@DoMaIn.OrG")).toBe("test@domain.org");
  });

  it("should trim and lowercase simultaneously", () => {
    expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
    expect(normalizeEmail(" Test@Domain.Org ")).toBe("test@domain.org");
  });

  it("should handle already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("should mask email local parts correctly", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("test@domain.org")).toBe("te**@domain.org");
    expect(maskEmail("alice@company.co.uk")).toBe("al***@company.co.uk");
  });

  it("should handle short local parts", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("should handle long local parts", () => {
    expect(maskEmail("verylongusername@example.com")).toBe(
      "ve**************@example.com"
    );
  });

  it("should return original input for invalid email format", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("@example.com")).toBe("@example.com");
    expect(maskEmail("user@")).toBe("user@");
  });

  it("should handle multiple @ symbols by using first split", () => {
    expect(maskEmail("user@test@example.com")).toBe("us**@test");
  });
});
