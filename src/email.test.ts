import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
    expect(isValidEmail("name+tag@company.org")).toBe(true);
    expect(isValidEmail("a@b.c")).toBe(true);
  });

  it("rejects emails without @ symbol", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("nodomain.com")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
  });

  it("rejects emails without TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("rejects emails with whitespace", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@ example.com")).toBe(false);
    expect(isValidEmail("user@example .com")).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(123 as unknown as string)).toBe(false);
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail({} as unknown as string)).toBe(false);
  });

  it("rejects emails longer than 254 characters", () => {
    const longLocal = "a".repeat(250);
    const longEmail = `${longLocal}@example.com`;
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("accepts emails at the 254 character limit", () => {
    // 246 chars local + @ + 7 chars domain = 254 total
    const local = "a".repeat(246);
    const email = `${local}@test.co`;
    expect(email.length).toBe(254);
    expect(isValidEmail(email)).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmail("\tuser@example.com\n")).toBe("user@example.com");
  });

  it("converts to lowercase", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
    expect(normalizeEmail("TEST@DOMAIN.ORG")).toBe("test@domain.org");
  });

  it("combines trim and lowercase", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("handles already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });
});

describe("maskEmail", () => {
  it("masks emails with local part longer than 2 chars", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("alice@domain.org")).toBe("al***@domain.org");
    expect(maskEmail("test@test.com")).toBe("te**@test.com");
  });

  it("masks emails with 2-character local part", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("masks emails with 1-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("handles emails without @ symbol gracefully", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
  });

  it("handles empty local part", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });

  it("preserves full domain", () => {
    expect(maskEmail("user@subdomain.example.com")).toBe("us**@subdomain.example.com");
  });

  it("masks long local parts correctly", () => {
    const longLocal = "verylongemailaddress";
    const email = `${longLocal}@example.com`;
    const masked = maskEmail(email);
    expect(masked).toBe(`ve${"*".repeat(18)}@example.com`);
    expect(masked.split("@")[0]!.length).toBe(longLocal.length);
  });
});
