import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "../src/email";

describe("isValidEmail", () => {
  it("returns true for valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("returns false for invalid inputs", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  it("returns false for emails exceeding 254 characters", () => {
    expect(isValidEmail("a".repeat(250) + "@example.com")).toBe(false);
  });

  it("allows alphanumeric and common symbols in local part", () => {
    expect(isValidEmail("user.name+tag@domain.com")).toBe(true);
    expect(isValidEmail("user_name@domain.com")).toBe(true);
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

  it("preserves already-normalized emails", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("masks local part keeping first two characters", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
    expect(maskEmail("johndoe@domain.org")).toBe("jo*****@domain.org");
  });

  it("leaves 2-char local part unmasked", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    expect(maskEmail("a@b.com")).toBe("a@b.com");
  });

  it("returns input unchanged if no @", () => {
    expect(maskEmail("invalid-email")).toBe("invalid-email");
  });

  it("returns input unchanged if empty local part", () => {
    expect(maskEmail("@domain.com")).toBe("@domain.com");
  });

  it("handles multi-part domain correctly", () => {
    expect(maskEmail("user@mail.example.com")).toBe("us**@mail.example.com");
  });
});