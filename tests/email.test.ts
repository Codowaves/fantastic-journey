import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("no-at-sign")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as never)).toBe(false);
    expect(isValidEmail(undefined as never)).toBe(false);
  });

  it("rejects emails exceeding 254 characters", () => {
    const maxLocal = "a".repeat(249) + "@b.co"; // 254 chars total
    expect(isValidEmail(maxLocal)).toBe(true);
    const overMax = "a".repeat(250) + "@b.co"; // 255 chars total
    expect(isValidEmail(overMax)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("converts to lowercase", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    expect(normalizeEmail("Test.User@Domain.Org")).toBe("test.user@domain.org");
  });

  it("handles already normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part preserving first two characters", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("test@domain.org")).toBe("te**@domain.org");
  });

  it("handles short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@****@example.com".replace("****@", ""));
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  it("returns input for invalid emails", () => {
    expect(maskEmail("invalid-email")).toBe("invalid-email");
    expect(maskEmail("@nodomain.com")).toBe("@nodomain.com");
    expect(maskEmail("no-at-sign")).toBe("no-at-sign");
  });

  it("preserves domain", () => {
    expect(maskEmail("user@sub.domain.com")).toBe("us**@sub.domain.com");
  });
});