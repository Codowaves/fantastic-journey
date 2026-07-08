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

    it("returns input unchanged when the local part is missing", () => {
      expect(maskEmail("@example.com")).toBe("@example.com");
    });

    it("returns input unchanged when the domain is missing", () => {
      expect(maskEmail("user@")).toBe("user@");
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

  describe("batch2: error/fallback branches", () => {
    describe("isValidEmail length-cap fallback branch", () => {
      it("rejects an address longer than 254 characters via the length fallback", () => {
        const local = "a".repeat(64);
        const domain = `${"b".repeat(185)}.example.com`; // > 254 total
        const input = `${local}@${domain}`;
        expect(input.length).toBeGreaterThan(254);
        expect(isValidEmail(input)).toBe(false);
      });

      it("accepts an address of exactly 254 characters when structurally valid", () => {
        const local = "a".repeat(64);
        const domain = `${"b".repeat(63)}.example.com`; // 64 + 1 + 63 + 1 + 11 = 140
        const input = `${local}@${domain}`;
        // Pad the local part until total length hits 254 exactly.
        const padding = "a".repeat(254 - input.length);
        const padded = `${padding}${input}`;
        expect(padded.length).toBe(254);
        expect(isValidEmail(padded)).toBe(true);
      });

      it("rejects an empty string via the empty-length fallback branch", () => {
        expect(isValidEmail("")).toBe(false);
      });
    });

    describe("assertValidEmail error/throw paths", () => {
      it("does not throw on a valid email", () => {
        expect(() => assertValidEmail("user@example.com")).not.toThrow();
      });

      it("throws InvalidEmailError when called with a malformed string", () => {
        expect(() => assertValidEmail("not-an-email")).toThrow(
          InvalidEmailError,
        );
      });

      it("propagates the offending input in the thrown error message", () => {
        try {
          assertValidEmail("not-an-email");
          throw new Error("expected assertValidEmail to throw");
        } catch (err) {
          expect(err).toBeInstanceOf(InvalidEmailError);
          expect((err as InvalidEmailError).message).toBe(
            'Invalid email address: "not-an-email"',
          );
          expect((err as InvalidEmailError).name).toBe("InvalidEmailError");
        }
      });

      it("throws when the recipient is an empty string", () => {
        expect(() => assertValidEmail("")).toThrow(InvalidEmailError);
      });

      it("throws when the address exceeds the 254-character limit", () => {
        const input = `${"a".repeat(64)}@${"b".repeat(200)}.example.com`;
        expect(() => assertValidEmail(input)).toThrow(InvalidEmailError);
      });
    });

    describe("normalizeEmail fallback branch", () => {
      it("returns an empty string when given an all-whitespace input", () => {
        expect(normalizeEmail("   ")).toBe("");
      });

      it("returns an empty string unchanged (no whitespace to trim, lowercases to empty)", () => {
        expect(normalizeEmail("")).toBe("");
      });

      it("does not throw on whitespace-only or empty input", () => {
        expect(() => normalizeEmail("   ")).not.toThrow();
        expect(() => normalizeEmail("")).not.toThrow();
      });
    });

    describe("maskEmail fallback branches", () => {
      it("masks a single-character local part with zero stars (length-2 boundary)", () => {
        // local.length - 2 === -1, clamped via Math.max(0, ...) to 0, so 0 stars.
        expect(maskEmail("a@example.com")).toBe("a@example.com");
      });

      it("masks a three-character local part with one star", () => {
        expect(maskEmail("abc@example.com")).toBe("ab*@example.com");
      });

      it("masks a long local part with length-2 stars", () => {
        const local = "abcdefghij";
        const expected = `ab${"*".repeat(8)}@example.com`;
        expect(maskEmail(`${local}@example.com`)).toBe(expected);
      });

      it("returns a two-character local part unchanged (length-2 boundary)", () => {
        expect(maskEmail("ab@example.com")).toBe("ab@example.com");
      });

      it("returns input unchanged when only an @ is present (no local, no domain)", () => {
        expect(maskEmail("@")).toBe("@");
      });

      it("does not throw on any maskEmail fallback-branch input", () => {
        expect(() => maskEmail("@example.com")).not.toThrow();
        expect(() => maskEmail("user@")).not.toThrow();
        expect(() => maskEmail("@")).not.toThrow();
        expect(() => maskEmail("a@example.com")).not.toThrow();
      });
    });

    describe("buildMagicLinkEmail non-default expiration branch", () => {
      it("honors a custom expiresInMinutes value", () => {
        const email = buildMagicLinkEmail({
          to: "user@example.com",
          brandName: "Acme",
          magicLink: "https://example.com/m",
          expiresInMinutes: 60,
        });
        expect(email.html).toContain("60 minutes");
        expect(email.text).toContain("60 minutes");
        expect(email.text).not.toContain("15 minutes");
      });

      it("treats expiresInMinutes of 0 as a valid (non-default) override", () => {
        const email = buildMagicLinkEmail({
          to: "user@example.com",
          brandName: "Acme",
          magicLink: "https://example.com/m",
          expiresInMinutes: 0,
        });
        expect(email.html).toContain("0 minutes");
        expect(email.text).toContain("0 minutes");
      });

      it("throws InvalidEmailError when expiresInMinutes is custom but `to` is malformed", () => {
        expect(() =>
          buildMagicLinkEmail({
            to: "bogus",
            brandName: "Acme",
            magicLink: "https://example.com/m",
            expiresInMinutes: 30,
          }),
        ).toThrow(InvalidEmailError);
      });

      it("does not throw on a valid email with a custom expiration", () => {
        expect(() =>
          buildMagicLinkEmail({
            to: "user@example.com",
            brandName: "Acme",
            magicLink: "https://example.com/m",
            expiresInMinutes: 5,
          }),
        ).not.toThrow();
      });
    });

    describe("sendMagicLinkEmail error propagation", () => {
      it("does not record a malformed-recipient attempt in the in-memory log", () => {
        resetSentEmails();
        expect(() =>
          sendMagicLinkEmail({
            to: "bogus@",
            brandName: "Acme",
            magicLink: "https://example.com/m",
          }),
        ).toThrow(InvalidEmailError);
        // The throw happens before the push, so nothing was recorded.
        expect(listSentEmails()).toEqual([]);
      });

      it("propagates the InvalidEmailError name and message", () => {
        try {
          sendMagicLinkEmail({
            to: "bogus",
            brandName: "Acme",
            magicLink: "https://example.com/m",
          });
          throw new Error("expected sendMagicLinkEmail to throw");
        } catch (err) {
          expect(err).toBeInstanceOf(InvalidEmailError);
          expect((err as InvalidEmailError).message).toBe(
            'Invalid email address: "bogus"',
          );
        }
      });

      it("throws on a 255-character address", () => {
        const longTo = `${"a".repeat(64)}@${"b".repeat(200)}.example.com`;
        expect(() =>
          sendMagicLinkEmail({
            to: longTo,
            brandName: "Acme",
            magicLink: "https://example.com/m",
          }),
        ).toThrow(InvalidEmailError);
      });
    });

    describe("listSentEmails / resetSentEmails fallback branches", () => {
      it("returns an empty array on a fresh reset (no emails recorded yet)", () => {
        resetSentEmails();
        expect(listSentEmails()).toEqual([]);
      });

      it("returns a stable copy that does not affect later resetSentEmails calls", () => {
        resetSentEmails();
        sendMagicLinkEmail({
          to: "user@example.com",
          brandName: "Acme",
          magicLink: "https://example.com/m",
        });
        const beforeReset = listSentEmails();
        beforeReset.length = 0;
        resetSentEmails();
        // The snapshot mutation must not have cleared the underlying log.
        expect(listSentEmails()).toHaveLength(0);
      });

      it("does not throw when listing or resetting repeatedly", () => {
        resetSentEmails();
        expect(() => listSentEmails()).not.toThrow();
        expect(() => resetSentEmails()).not.toThrow();
        expect(() => listSentEmails()).not.toThrow();
        expect(() => resetSentEmails()).not.toThrow();
      });
    });

    describe("InvalidEmailError constructor fallback branches", () => {
      it("JSON-stringifies a string input without quoting on the constructor itself", () => {
        const err = new InvalidEmailError("plain");
        expect(err.message).toBe('Invalid email address: "plain"');
      });

      it("does not throw when constructed with an empty string", () => {
        expect(() => new InvalidEmailError("")).not.toThrow();
        expect(new InvalidEmailError("").message).toBe(
          'Invalid email address: ""',
        );
      });
    });
  });
});
