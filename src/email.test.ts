import { describe, expect, it } from "vitest";

import {
  assertValidEmail,
  buildMagicLinkEmail,
  InvalidEmailError,
  isValidEmail,
  listSentEmails,
  maskEmail,
  normalizeEmail,
  resetSentEmails,
  sendMagicLinkEmail,
} from "./email";

describe("email helpers", () => {
  describe("isValidEmail", () => {
    it("accepts representative valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
    });

    it("rejects malformed addresses", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("no-at-sign")).toBe(false);
      expect(isValidEmail("missing-domain@")).toBe(false);
      expect(isValidEmail("missing-local@.com")).toBe(false);
      expect(isValidEmail("no-tld@example")).toBe(false);
      expect(isValidEmail("spaces in@addr.com")).toBe(false);
      expect(isValidEmail("trailing@space.com ")).toBe(false);
    });

    it("accepts an address at the 254-character boundary", () => {
      // local = "a".repeat(64), "@", domain padded up to 254 total chars.
      const local = "a".repeat(64);
      const domainMax = 254 - local.length - 1; // -1 for '@'
      const address = `${local}@${"a".repeat(domainMax - 4)}.com`;
      expect(address.length).toBe(254);
      expect(isValidEmail(address)).toBe(true);
    });

    it("rejects an address exceeding the 254-character limit", () => {
      const tooLong = `${"a".repeat(64)}@${"a".repeat(191)}.com`;
      expect(tooLong.length).toBeGreaterThan(254);
      expect(isValidEmail(tooLong)).toBe(false);
    });

    it("rejects addresses with whitespace in the middle or around the @", () => {
      expect(isValidEmail("user @example.com")).toBe(false);
      expect(isValidEmail("user@ example.com")).toBe(false);
      expect(isValidEmail(" leading@example.com")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims surrounding whitespace and lowercases the address", () => {
      expect(normalizeEmail("  User.Name+Tag@Example.COM  ")).toBe(
        "user.name+tag@example.com",
      );
    });

    it("returns an empty string unchanged", () => {
      expect(normalizeEmail("")).toBe("");
    });

    it("normalizes an already-clean lowercase address", () => {
      expect(normalizeEmail("user@example.com")).toBe("user@example.com");
    });
  });

  describe("maskEmail", () => {
    it("masks the local part after the first two characters", () => {
      expect(maskEmail("customer@example.com")).toBe("cu******@example.com");
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("returns input unchanged when the local part is missing", () => {
      expect(maskEmail("@example.com")).toBe("@example.com");
    });

    it("returns input unchanged when the domain is missing", () => {
      expect(maskEmail("user@")).toBe("user@");
    });

    it("masks single-character and two-character local parts correctly", () => {
      expect(maskEmail("a@example.com")).toBe("a@example.com");
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("returns input unchanged when there is no @ sign", () => {
      expect(maskEmail("not-an-email")).toBe("not-an-email");
      expect(maskEmail("")).toBe("");
    });
  });

  describe("assertValidEmail", () => {
    it("throws InvalidEmailError carrying the offending input", () => {
      expect(() => {
        throw new InvalidEmailError("bogus");
      }).toThrow(InvalidEmailError);
      const err = new InvalidEmailError("bogus");
      expect(err.name).toBe("InvalidEmailError");
      expect(err.message).toBe('Invalid email address: "bogus"');
    });

    it("returns without throwing for a valid address", () => {
      expect(() => assertValidEmail("user@example.com")).not.toThrow();
    });

    it("throws on an empty string", () => {
      expect(() => assertValidEmail("")).toThrow(InvalidEmailError);
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
      expect(email.text).toContain(
        "https://example.com/auth/magic-link/verify",
      );
    });

    it("throws InvalidEmailError for a malformed recipient", () => {
      expect(() =>
        buildMagicLinkEmail({
          to: "not-an-email",
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(InvalidEmailError);
    });

    it("respects a custom expiresInMinutes value", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
        expiresInMinutes: 60,
      });
      expect(email.text).toContain("60 minutes");
      expect(email.html).toContain("60 minutes");
    });
  });

  describe("sendMagicLinkEmail", () => {
    it("throws InvalidEmailError for a malformed recipient", () => {
      expect(() =>
        sendMagicLinkEmail({
          to: "bogus@",
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(InvalidEmailError);
    });

    it("records the sent email in the in-memory log", () => {
      resetSentEmails();
      const email = sendMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
      });
      expect(listSentEmails()).toEqual([email]);
    });

    it("resetSentEmails clears the in-memory log", () => {
      sendMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
      });
      expect(listSentEmails().length).toBeGreaterThan(0);
      resetSentEmails();
      expect(listSentEmails()).toEqual([]);
    });

    it("listSentEmails returns a copy that does not mutate the log", () => {
      resetSentEmails();
      sendMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
      });
      const snapshot = listSentEmails();
      snapshot.pop();
      expect(listSentEmails().length).toBe(1);
    });
  });
});
