import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("no-at-sign")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false);
  });

  it("rejects emails longer than 254 chars", () => {
    expect(isValidEmail("a".repeat(250) + "@b.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("handles already-normalized input", () => {
    expect(normalizeEmail("lowercase@domain.com")).toBe("lowercase@domain.com");
  });
});

describe("maskEmail", () => {
  it("masks local part keeping first 2 chars", () => {
    expect(maskEmail("john.doe@example.com")).toBe("jo******@example.com");
    expect(maskEmail("admin@domain.co")).toBe("ad***@domain.co");
  });

  it("keeps short local parts as-is", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("returns input for malformed emails", () => {
    expect(maskEmail("no-at-sign")).toBe("no-at-sign");
    expect(maskEmail("")).toBe("");
  });

  it("preserves domain", () => {
    expect(maskEmail("test@sub.domain.com")).toBe("te**@sub.domain.com");
  });
});