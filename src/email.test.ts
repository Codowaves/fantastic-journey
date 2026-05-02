import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects emails with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects strings over 254 chars", () => {
    expect(isValidEmail("a".repeat(250) + "@b.com")).toBe(false);
  });

  it("rejects non-string inputs", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  User@EXAMPLE.COM  ")).toBe("user@example.com");
  });
});

describe("maskEmail", () => {
  it("masks middle of local part", () => {
    expect(maskEmail("john.doe@example.com")).toBe("jo******@example.com");
  });

  it("handles short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("ab@example.com");
  });

  it("returns input for invalid emails", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });
});