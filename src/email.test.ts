import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, maskEmail } from "./email";

describe("email utilities", () => {
  describe("maskEmail", () => {
    it("masks single-character local part", () => {
      expect(maskEmail("a@example.com")).toBe("*@example.com");
    });

    it("masks two-character local part", () => {
      expect(maskEmail("ab@example.com")).toBe("a*@example.com");
    });

    it("masks longer local parts with single-char prefix", () => {
      expect(maskEmail("alice@example.com")).toBe("a****@example.com");
    });

    it("returns input for invalid/non-email strings", () => {
      expect(maskEmail("notanemail")).toBe("notanemail");
      expect(maskEmail("")).toBe("");
      expect(maskEmail("missing@domain")).toBe("m******@domain");
    });
  });

  describe("isValidEmail", () => {
    it("validates correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("rejects invalid inputs", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims and lowercases", () => {
      expect(normalizeEmail("  Test@EXAMPLE.COM  ")).toBe("test@example.com");
    });
  });
});