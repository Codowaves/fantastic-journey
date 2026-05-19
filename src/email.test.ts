import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("email utilities", () => {
  describe("maskEmail", () => {
    it("passes through invalid input", () => {
      expect(maskEmail("notanemail")).toBe("notanemail");
      expect(maskEmail("")).toBe("");
      expect(maskEmail("a@")).toBe("a@");
      expect(maskEmail("@b.com")).toBe("@b.com");
    });

    it("masks a 1-char local part fully", () => {
      expect(maskEmail("a@example.com")).toBe("*@example.com");
    });

    it("masks a 2-char local part keeping first char", () => {
      expect(maskEmail("ab@example.com")).toBe("a*@example.com");
    });

    it("masks a 3+ char local part with prefix", () => {
      expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
      expect(maskEmail("alex@example.com")).toBe("al**@example.com");
    });
  });

  describe("isValidEmail", () => {
    it("returns true for valid emails", () => {
      expect(isValidEmail("a@b.com")).toBe(true);
      expect(isValidEmail("test@example.org")).toBe(true);
    });

    it("returns false for invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("a@")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims and lowercases", () => {
      expect(normalizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
    });
  });
});