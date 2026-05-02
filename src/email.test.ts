import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("returns true for valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("returns false for emails exceeding max length", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases the email", () => {
    expect(normalizeEmail("  User@Domain.COM  ")).toBe("user@domain.com");
  });

  it("handles already normalized emails", () => {
    expect(normalizeEmail("user@domain.com")).toBe("user@domain.com");
  });
});

describe("maskEmail", () => {
  it("masks all but first two characters of local part", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
  });

  it("handles short local parts", () => {
    expect(maskEmail("ab@domain.com")).toBe("ab@domain.com");
  });

  it("returns input for invalid email format", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("@domain.com")).toBe("@domain.com");
  });
});