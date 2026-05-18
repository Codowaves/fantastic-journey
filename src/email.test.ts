import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email.js";

describe("maskEmail", () => {
  it("masks single-character local part fully", () => {
    expect(maskEmail("a@example.com")).toBe("*@example.com");
  });

  it("masks two-character local part keeping first char", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("keeps prefix for longer local parts", () => {
    expect(maskEmail("alice@example.com")).toBe("al***@example.com");
  });

  it("passes through invalid input", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
    expect(maskEmail("")).toBe("");
    expect(maskEmail("@example.com")).toBe("@example.com");
    expect(maskEmail("local@")).toBe("local@");
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("test@example.org")).toBe(true);
  });

  it("rejects invalid input", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("noampersand")).toBe(false);
    expect(isValidEmail("a b@example.com")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });
});
