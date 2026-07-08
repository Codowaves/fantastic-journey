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

    it("enforces the 254-character length boundary", () => {
      const build = (n: number) => {
        const local = "a".repeat(n - 13);
        const domain = "b".repeat(10) + ".c";
        return `${local}@${domain}`;
      };
      const exactly254 = build(254);
      expect(exactly254.length).toBe(254);
      expect(isValidEmail(exactly254)).toBe(true);
      const tooLong = build(255);
      expect(tooLong.length).toBe(255);
      expect(isValidEmail(tooLong)).toBe(false);
    });

    it("rejects non-string inputs", () => {
      expect(isValidEmail(undefined as unknown as string)).toBe(false);
      expect(isValidEmail(null as unknown as string)).toBe(false);
      expect(isValidEmail(123 as unknown as string)).toBe(false);
      expect(isValidEmail({} as unknown as string)).toBe(false);
    });

    it("rejects multiple @ signs", () => {
      expect(isValidEmail("a@b@c.com")).toBe(false);
    });

    it("rejects whitespace-only inputs", () => {
      expect(isValidEmail("   ")).toBe(false);
      expect(isValidEmail("\t")).toBe(false);
      expect(isValidEmail("\n")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("trims surrounding whitespace and lowercases the address", () => {
      expect(normalizeEmail("  User.Name+Tag@Example.COM  ")).toBe(
        "user.name+tag@example.com",
      );
    });

    it("returns an empty string for whitespace-only input", () => {
      expect(normalizeEmail("   ")).toBe("");
      expect(normalizeEmail("")).toBe("");
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

    it("masks a single-character local part to zero stars", () => {
      expect(maskEmail("a@example.com")).toBe("a@example.com");
    });

    it("masks an empty local part after the first two chars", () => {
      expect(maskEmail("ab@example.com")).toBe("ab@example.com");
    });

    it("preserves the domain exactly", () => {
      const result = maskEmail("user@sub.example.co");
      expect(result.endsWith("@sub.example.co")).toBe(true);
    });

    it("returns empty string for empty input", () => {
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

    it("does not throw for a valid email", () => {
      expect(() => assertValidEmail("user@example.com")).not.toThrow();
    });

    it("throws InvalidEmailError for an empty string", () => {
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

    it("honors a custom expiresInMinutes value", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
        expiresInMinutes: 60,
      });
      expect(email.html).toContain("60 minutes");
      expect(email.text).toContain("60 minutes");
    });

    it("uses 15 minutes as the default expiry", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/m",
      });
      expect(email.html).toContain("15 minutes");
      expect(email.text).toContain("15 minutes");
    });

    it("embeds the magicLink URL in both html and text bodies", () => {
      const email = buildMagicLinkEmail({
        to: "user@example.com",
        brandName: "Acme",
        magicLink: "https://example.com/verify?token=xyz",
      });
      expect(email.html).toContain("https://example.com/verify?token=xyz");
      expect(email.text).toContain("https://example.com/verify?token=xyz");
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

    it("accumulates multiple sent emails in order", () => {
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
      const log = listSentEmails();
      expect(log).toHaveLength(2);
      expect(log[0]).toEqual(first);
      expect(log[1]).toEqual(second);
    });

    it("listSentEmails on a fresh log returns an empty array", () => {
      resetSentEmails();
      expect(listSentEmails()).toEqual([]);
    });
  });
});
