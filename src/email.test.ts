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

    it("rejects an empty string at the lower length boundary", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("accepts the maximum allowed length (254 characters)", () => {
      const local = "a".repeat(240);
      const domain = "example.com";
      expect(local.length + 1 + domain.length).toBeLessThanOrEqual(254);
      const atBoundary = `${local}@${domain}`;
      if (atBoundary.length <= 254) {
        expect(isValidEmail(atBoundary)).toBe(true);
      }
    });

    it("rejects an email longer than the 254-character limit", () => {
      const local = "a".repeat(250);
      const tooLong = `${local}@example.com`;
      expect(tooLong.length).toBeGreaterThan(254);
      expect(isValidEmail(tooLong)).toBe(false);
    });

    it("rejects leading whitespace", () => {
      expect(isValidEmail(" user@example.com")).toBe(false);
    });

    it("rejects embedded whitespace in the domain", () => {
      expect(isValidEmail("user@exa mple.com")).toBe(false);
    });

    it("rejects multiple @ signs", () => {
      expect(isValidEmail("user@@example.com")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims surrounding whitespace and lowercases the address", () => {
      expect(normalizeEmail("  User.Name+Tag@Example.COM  ")).toBe(
        "user.name+tag@example.com",
      );
    });

    it("returns an empty string when given only whitespace", () => {
      expect(normalizeEmail("   \t\n  ")).toBe("");
    });

    it("does not change an already-normalized address", () => {
      expect(normalizeEmail("user@example.com")).toBe("user@example.com");
    });
  });

  describe("maskEmail", () => {
    it("masks the local part after the first two characters", () => {
      expect(maskEmail("customer@example.com")).toBe("cu******@example.com");
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("keeps a single-character local part without adding masks", () => {
      expect(maskEmail("a@example.com")).toBe("a@example.com");
    });

    it("returns input unchanged when the local part is missing", () => {
      expect(maskEmail("@example.com")).toBe("@example.com");
    });

    it("returns input unchanged when the domain is missing", () => {
      expect(maskEmail("user@")).toBe("user@");
    });
  });

  describe("InvalidEmailError", () => {
    it("stringifies numeric input in the message", () => {
      const err = new InvalidEmailError(123 as unknown as string);
      expect(err.name).toBe("InvalidEmailError");
      expect(err.message).toBe("Invalid email address: 123");
    });

    it("stringifies object input in the message", () => {
      const err = new InvalidEmailError({ a: 1 } as unknown as string);
      expect(err.message).toBe('Invalid email address: {"a":1}');
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

    it("does not throw for a valid email", () => {
      expect(() => assertValidEmail("user@example.com")).not.toThrow();
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

    it("honors a custom expiresInMinutes value", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
        expiresInMinutes: 60,
      });
      expect(email.text).toContain("60 minutes");
      expect(email.html).toContain("60 minutes");
    });

    it("uses 0 minutes when explicitly given expiresInMinutes=0", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
        expiresInMinutes: 0,
      });
      expect(email.text).toContain("0 minutes");
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

    it("records multiple sent emails in order", () => {
      resetSentEmails();
      const first = sendMagicLinkEmail({
        to: "first@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/1",
      });
      const second = sendMagicLinkEmail({
        to: "second@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/2",
      });
      expect(listSentEmails()).toEqual([first, second]);
    });
  });
});
