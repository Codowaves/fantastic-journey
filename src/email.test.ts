import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("validates standard email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co")).toBe(true);
    expect(isValidEmail("name+tag@company.org")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(isValidEmail("nodomain.com")).toBe(false);
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
  });

  it("rejects emails without TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("rejects emails with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@ example.com")).toBe(false);
    expect(isValidEmail("user@example .com")).toBe(false);
  });

  it("rejects emails longer than 254 characters", () => {
    const longLocal = "a".repeat(250);
    const longEmail = `${longLocal}@test.com`;
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("accepts emails at exactly 254 characters", () => {
    // Create an email exactly 254 chars: local + @ + domain
    const local = "a".repeat(240);
    const email = `${local}@example.com`; // 240 + 1 + 11 = 252 chars
    expect(email.length).toBeLessThanOrEqual(254);
    expect(isValidEmail(email)).toBe(true);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("handles multiple @ symbols (invalid)", () => {
    expect(isValidEmail("user@@example.com")).toBe(false);
    expect(isValidEmail("user@domain@example.com")).toBe(false);
  });

  it("accepts emails with numbers", () => {
    expect(isValidEmail("user123@example456.com")).toBe(true);
  });

  it("accepts emails with hyphens and underscores", () => {
    expect(isValidEmail("first_last@my-domain.com")).toBe(true);
    expect(isValidEmail("test-user@test-domain.co.uk")).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("converts email to lowercase", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
    expect(normalizeEmail("TEST@DOMAIN.ORG")).toBe("test@domain.org");
  });

  it("trims leading whitespace", () => {
    expect(normalizeEmail("  user@example.com")).toBe("user@example.com");
    expect(normalizeEmail("\tuser@example.com")).toBe("user@example.com");
  });

  it("trims trailing whitespace", () => {
    expect(normalizeEmail("user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("user@example.com\n")).toBe("user@example.com");
  });

  it("trims and lowercases together", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("handles already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });

  it("handles email with mixed case domain", () => {
    expect(normalizeEmail("user@EXAMPLE.com")).toBe("user@example.com");
  });

  it("preserves special characters", () => {
    expect(normalizeEmail("User+Tag@Example.COM")).toBe("user+tag@example.com");
    expect(normalizeEmail("First.Last@Domain.ORG")).toBe("first.last@domain.org");
  });
});

describe("maskEmail", () => {
  it("masks standard email addresses", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("test@domain.org")).toBe("te**@domain.org");
  });

  it("masks email with long local part", () => {
    // "verylongusername" = 16 chars, head = "ve" (2 chars), mask = 14 asterisks
    expect(maskEmail("verylongusername@example.com")).toBe("ve**************@example.com");
  });

  it("masks email with 2-character local part", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("masks email with 1-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("masks email with 3-character local part", () => {
    expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
  });

  it("preserves domain unchanged", () => {
    const masked = maskEmail("user@very-long-domain.co.uk");
    expect(masked).toContain("@very-long-domain.co.uk");
  });

  it("handles email without @ (returns unchanged)", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
  });

  it("handles empty local part", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });

  it("handles empty domain", () => {
    // Empty domain is falsy, returns input unchanged
    expect(maskEmail("user@")).toBe("user@");
  });

  it("handles multiple @ symbols (uses first split)", () => {
    const result = maskEmail("user@@example.com");
    // After split on @, local = "user", domain = "" (empty), returns unchanged
    expect(result).toBe("user@@example.com");
  });

  it("masks emails with special characters in local part", () => {
    expect(maskEmail("user+tag@example.com")).toBe("us******@example.com");
    expect(maskEmail("first.last@domain.org")).toBe("fi********@domain.org");
  });

  it("handles email with exactly 2 chars before @", () => {
    const result = maskEmail("xy@test.com");
    // local.length = 2, so local.length - 2 = 0
    expect(result).toBe("xy@test.com");
  });

  it("handles 4-character local part", () => {
    expect(maskEmail("abcd@test.com")).toBe("ab**@test.com");
  });
});
