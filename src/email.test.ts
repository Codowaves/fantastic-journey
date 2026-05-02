import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.org")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
    expect(isValidEmail("user name@domain.com")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  it("returns false for emails exceeding 254 characters", () => {
    const longLocal = "a".repeat(250) + "@b.com";
    expect(isValidEmail(longLocal)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace", () => {
    expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
    expect(normalizeEmail("\ttest@example.com\n")).toBe("test@example.com");
  });

  it("converts to lowercase", () => {
    expect(normalizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
    expect(normalizeEmail("User.Name@Domain.Org")).toBe("user.name@domain.org");
  });

  it("handles already-normalized emails", () => {
    expect(normalizeEmail("test@example.com")).toBe("test@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part, preserves domain", () => {
    expect(maskEmail("test@example.com")).toBe("te**@example.com");
    expect(maskEmail("user@domain.org")).toBe("us**@domain.org");
  });

  it("shows first two characters, one asterisk per character beyond two", () => {
    expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
    expect(maskEmail("abcdef@example.com")).toBe("ab****@example.com");
  });

  it("returns local part unchanged when 2 characters or fewer", () => {
    expect(maskEmail("a@b.com")).toBe("a@b.com");
    expect(maskEmail("ab@b.com")).toBe("ab@b.com");
  });

  it("returns input for invalid emails", () => {
    expect(maskEmail("invalid")).toBe("invalid");
    expect(maskEmail("")).toBe("");
  });
});
