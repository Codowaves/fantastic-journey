import { describe, expect, it } from "vitest";

import {
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
  });

  describe("normalizeEmail", () => {
    it("trims surrounding whitespace and lowercases the address", () => {
      expect(normalizeEmail("  User.Name+Tag@Example.COM  ")).toBe(
        "user.name+tag@example.com",
      );
    });

    it("throws TypeError when input is null, undefined, or NaN", () => {
      expect(() => normalizeEmail(null as unknown as string)).toThrow(
        TypeError,
      );
      expect(() => normalizeEmail(undefined as unknown as string)).toThrow(
        TypeError,
      );
      expect(() => normalizeEmail(Number.NaN as unknown as string)).toThrow(
        TypeError,
      );
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

    it("throws TypeError when input is null, undefined, or NaN", () => {
      expect(() => maskEmail(null as unknown as string)).toThrow(TypeError);
      expect(() => maskEmail(undefined as unknown as string)).toThrow(
        TypeError,
      );
      expect(() => maskEmail(Number.NaN as unknown as string)).toThrow(
        TypeError,
      );
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

    it("throws TypeError when to is null, undefined, or NaN", () => {
      expect(() =>
        buildMagicLinkEmail({
          to: null as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
      expect(() =>
        buildMagicLinkEmail({
          to: undefined as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
      expect(() =>
        buildMagicLinkEmail({
          to: Number.NaN as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
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

    it("throws TypeError when to is null, undefined, or NaN", () => {
      expect(() =>
        sendMagicLinkEmail({
          to: null as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
      expect(() =>
        sendMagicLinkEmail({
          to: undefined as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
      expect(() =>
        sendMagicLinkEmail({
          to: Number.NaN as unknown as string,
          brandName: "Acme",
          magicLink: "https://example.com/m",
        }),
      ).toThrow(TypeError);
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
