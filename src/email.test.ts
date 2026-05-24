import { describe, expect, it } from "vitest";

import { isValidEmail, maskEmail, normalizeEmail } from "./email";

describe("email helpers", () => {
  describe("isValidEmail", () => {
    it("accepts representative valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
    });
  });

  describe("normalizeEmail", () => {
    it("trims surrounding whitespace and lowercases the address", () => {
      expect(normalizeEmail("  User.Name+Tag@Example.COM  ")).toBe(
        "user.name+tag@example.com",
      );
    });
  });

  describe("maskEmail", () => {
    it("masks the local part after the first two characters", () => {
      expect(maskEmail("customer@example.com")).toBe("cu******@example.com");
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });
  });
});
