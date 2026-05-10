import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("rejects non-string input", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
    expect(isValidEmail({} as any)).toBe(false);
  });

  it("rejects emails longer than 254 characters", () => {
    const longLocal = "a".repeat(250);
    const longEmail = `${longLocal}@example.com`;
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("rejects invalid email formats", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("noatsign.com")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
    expect(isValidEmail("double@@example.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases email addresses", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    expect(normalizeEmail("TEST@DOMAIN.ORG")).toBe("test@domain.org");
  });

  it("handles already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles edge cases", () => {
    expect(normalizeEmail("")).toBe("");
    expect(normalizeEmail("   ")).toBe("");
    expect(normalizeEmail("A@B.C")).toBe("a@b.c");
  });
});

describe("maskEmail", () => {
  it("masks the local part of email addresses", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("test@domain.org")).toBe("te**@domain.org");
    expect(maskEmail("alice@company.co.uk")).toBe("al***@company.co.uk");
  });

  it("handles short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("returns input unchanged for invalid formats", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("@nodomain.com")).toBe("@nodomain.com");
  });

  it("handles edge cases with domain only", () => {
    const result = maskEmail("@example.com");
    expect(result).toBe("@example.com");
  });
});
