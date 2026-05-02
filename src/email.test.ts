import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("test@")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("test @example.com")).toBe(false);
  });

  it("rejects non-string", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });

  it("rejects email over 254 chars", () => {
    const long = "a".repeat(250) + "@b.com";
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace", () => {
    expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
  });

  it("converts to lowercase", () => {
    expect(normalizeEmail("Test@Example.COM")).toBe("test@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part, keeps domain", () => {
    expect(maskEmail("test@example.com")).toBe("te**@example.com");
  });

  it("shows first 2 chars", () => {
    expect(maskEmail("abcdef@example.com")).toBe("ab****@example.com");
  });

  it("returns input for single-char local part", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("returns input for invalid email", () => {
    expect(maskEmail("invalid")).toBe("invalid");
  });

  it("returns input for 2-char local part", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });
});