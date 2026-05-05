import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("user exam ple@example.com")).toBe(false);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  it("rejects email over 254 chars", () => {
    const long = "a".repeat(250) + "@b.com";
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  User@EXAMPLE.COM  ")).toBe("user@example.com");
  });

  it("handles already-normalized email", () => {
    expect(normalizeEmail("lowercase@test.org")).toBe("lowercase@test.org");
  });
});

describe("maskEmail", () => {
  it("masks middle of local part", () => {
    expect(maskEmail("john.doe@example.com")).toBe("jo******@example.com");
  });

  it("shows first 2 chars of local part", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("returns input for invalid email", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });

  it("handles single-char local part", () => {
    expect(maskEmail("a@example.com")).toBe("a@example.com");
  });
});