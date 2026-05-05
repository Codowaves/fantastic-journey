import { describe, expect, test } from "bun:test";
import { isValidEmail, maskEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  test("happy path - valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  test("edge - empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  test("edge - missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  test("edge - missing local part", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  test("edge - missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  test("edge - whitespace in email", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  test("edge - email exceeds 254 chars", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  test("edge - non-string input", () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  test("happy path - lowercase and trimmed", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  test("edge - already normalized", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  test("edge - only whitespace", () => {
    expect(normalizeEmail("   ")).toBe("");
  });
});

describe("maskEmail", () => {
  test("happy path - masks local part", () => {
    expect(maskEmail("user@example.com")).toBe("us**@example.com");
  });

  test("edge - short local part (2 chars)", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  test("edge - single char local part", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });

  test("edge - invalid email (no @)", () => {
    expect(maskEmail("userexample.com")).toBe("userexample.com");
  });

  test("edge - empty string", () => {
    expect(maskEmail("")).toBe("");
  });

  test("edge - only @", () => {
    expect(maskEmail("@")).toBe("@");
  });
});