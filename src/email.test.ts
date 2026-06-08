import { describe, expect, it } from "vitest";

import {
  InvalidEmailError,
  assertValidEmail,
  buildMagicLinkEmail,
  isValidEmail,
  maskEmail,
  normalizeEmail,
} from "./email";

describe("email helpers", () => {
  describe("isValidEmail", () => {
    it("accepts representative valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
    });

    it("rejects malformed email addresses", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("missing@domain")).toBe(false);
      expect(isValidEmail("@nodomain.com")).toBe(false);
      expect(isValidEmail("spaces in@addr.com")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
    });
  });

  describe("assertValidEmail", () => {
    it("does not throw for valid email addresses", () => {
      expect(() => assertValidEmail("user@example.com")).not.toThrow();
      expect(() =>
        assertValidEmail("first.last+tag@sub.example.co"),
      ).not.toThrow();
    });

    it("throws InvalidEmailError with the offending value for malformed addresses", () => {
      expect(() => assertValidEmail("notanemail")).toThrow(InvalidEmailError);
      expect(() => assertValidEmail("notanemail")).toThrow(
        /Invalid email address/,
      );
      expect(() => assertValidEmail("missing@domain")).toThrow(
        InvalidEmailError,
      );
      expect(() => assertValidEmail("")).toThrow(InvalidEmailError);
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

  describe("buildMagicLinkEmail", () => {
    it("renders a branded 15-minute single-use sign-in email", () => {
      const email = buildMagicLinkEmail({
        to: "User@Example.com",
        brandName: "Acme Workspace",
        magicLink: "https://example.com/auth/magic-link/verify?token=abc",
      });

      expect(email).toMatchObject({
        to: "user@example.com",
        subject: "Acme Workspace sign-in link",
      });
      expect(email.html).toContain("Acme Workspace");
      expect(email.text).toContain("15 minutes");
      expect(email.text).toContain("https://example.com/auth/magic-link/verify");
    });
  });
});
