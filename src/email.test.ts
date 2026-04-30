import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts a simple valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects a string without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects a string without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects strings longer than 254 chars", () => {
    const long = "a".repeat(250) + "@b.com";
    expect(isValidEmail(long)).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("masks all but first two chars of local part", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
  });

  it("keeps short local parts as-is", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("returns input for malformed emails", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
  });
});
