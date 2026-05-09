import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("should return true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
    expect(isValidEmail("name+tag@example.org")).toBe(true);
    expect(isValidEmail("user123@test-domain.com")).toBe(true);
  });

  it("should return false for email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("user.example.com")).toBe(false);
  });

  it("should return false for email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("should return false for email without TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("should return false for email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@ example.com")).toBe(false);
    expect(isValidEmail("user@example .com")).toBe(false);
  });

  it("should return false for non-string input", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });

  it("should return false for email longer than 254 characters", () => {
    const longLocal = "a".repeat(250);
    const longEmail = `${longLocal}@example.com`;
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should return true for email exactly 254 characters", () => {
    const local = "a".repeat(242);
    const email = `${local}@example.com`;
    expect(email.length).toBe(254);
    expect(isValidEmail(email)).toBe(true);
  });

  it("should return false for multiple @ symbols", () => {
    expect(isValidEmail("user@@example.com")).toBe(false);
    expect(isValidEmail("user@domain@example.com")).toBe(false);
  });

  it("should handle edge case domains", () => {
    expect(isValidEmail("user@localhost.localdomain")).toBe(true);
    expect(isValidEmail("test@x.y")).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("should convert email to lowercase", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    expect(normalizeEmail("Test.User@Domain.Com")).toBe("test.user@domain.com");
  });

  it("should trim whitespace from email", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("\tuser@example.com\n")).toBe("user@example.com");
  });

  it("should trim and lowercase together", () => {
    expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
  });

  it("should handle already normalized email", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("should handle empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });

  it("should handle whitespace-only string", () => {
    expect(normalizeEmail("   ")).toBe("");
  });
});

describe("maskEmail", () => {
  it("should mask standard email addresses", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("test@domain.org")).toBe("te**@domain.org");
  });

  it("should mask long local parts correctly", () => {
    expect(maskEmail("verylongusername@example.com")).toBe("ve**************@example.com");
  });

  it("should handle short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("should return original string if no @ present", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("user.example.com")).toBe("user.example.com");
  });

  it("should return original string if @ is at start", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });

  it("should return original string if @ is at end", () => {
    expect(maskEmail("user@")).toBe("user@");
  });

  it("should handle single character local part", () => {
    expect(maskEmail("x@example.com")).toBe("x@example.com");
  });

  it("should preserve domain completely", () => {
    expect(maskEmail("user@sub.domain.example.com")).toBe("us**@sub.domain.example.com");
  });

  it("should handle email with plus addressing", () => {
    expect(maskEmail("user+tag@example.com")).toBe("us******@example.com");
  });

  it("should handle email with dots in local part", () => {
    expect(maskEmail("first.last@example.com")).toBe("fi********@example.com");
  });
});
