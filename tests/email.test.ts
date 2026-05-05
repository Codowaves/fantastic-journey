import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email.js";

describe("isValidEmail", () => {
  it("returns true for valid email", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("returns false for email with spaces", () => {
    expect(isValidEmail("test @example.com")).toBe(false);
  });

  it("returns false for email without @", () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });

  it("returns false for email over 254 chars", () => {
    const long = "a".repeat(250) + "@example.com";
    expect(isValidEmail(long)).toBe(false);
  });

  it("returns false for non-string input", () => {
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Test@EXAMPLE.COM  ")).toBe("test@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part", () => {
    expect(maskEmail("test@example.com")).toBe("te**@example.com");
  });

  it("shows only first 2 chars when local part is 2 chars", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("returns input unchanged if no @", () => {
    expect(maskEmail("invalid")).toBe("invalid");
  });
});
